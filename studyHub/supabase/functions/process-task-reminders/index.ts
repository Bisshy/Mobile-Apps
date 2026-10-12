import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (_req, ctx) => {
      try {
        const supabase = ctx.supabaseAdmin;

        const now = new Date();

        // Delete completed tasks that have been completed
        // for 24 hours or longer.
        const cleanupCutoff = new Date(
          now.getTime() - 24 * 60 * 60 * 1000,
        );

        const {
          data: completedTasks,
          error: cleanupQueryError,
        } = await supabase
          .from("tasks")
          .select("id")
          .eq("completed", true)
          .not("completed_at", "is", null)
          .lte(
            "completed_at",
            cleanupCutoff.toISOString(),
          );

        if (cleanupQueryError) {
          console.error(
            "Failed to find completed tasks for cleanup:",
            cleanupQueryError,
          );
        } else if (
          completedTasks &&
          completedTasks.length > 0
        ) {
          const completedTaskIds =
            completedTasks.map(
              (task) => task.id,
            );

          // Remove related notification records first
          // because task_notifications references tasks.
          const {
            error: notificationCleanupError,
          } = await supabase
            .from("task_notifications")
            .delete()
            .in(
              "task_id",
              completedTaskIds,
            );

          if (notificationCleanupError) {
            console.error(
              "Failed to delete task notifications during cleanup:",
              notificationCleanupError,
            );
          } else {
            const {
              error: taskCleanupError,
            } = await supabase
              .from("tasks")
              .delete()
              .in(
                "id",
                completedTaskIds,
              );

            if (taskCleanupError) {
              console.error(
                "Failed to delete completed tasks:",
                taskCleanupError,
              );
            } else {
              console.log(
                `Deleted ${completedTaskIds.length} completed task(s) older than 24 hours.`,
              );
            }
          }
        }

        // Get incomplete tasks that are due within the next hour.
        //
        // We intentionally keep this query limited to tasks that
        // are still upcoming. The reminder calculation below will
        // determine whether the reminder time has arrived.
        const maxReminderTime = new Date(
          now.getTime() +
            60 * 60 * 1000,
        );

        const {
          data: tasks,
          error: taskError,
        } = await supabase
          .from("tasks")
          .select(
            "id, user_id, title, due_date, priority",
          )
          .eq("completed", false)
          .gte(
            "due_date",
            now.toISOString(),
          )
          .lte(
            "due_date",
            maxReminderTime.toISOString(),
          );

        if (taskError) {
          console.error(
            "Failed to retrieve tasks:",
            taskError,
          );

          return Response.json(
            {
              error: "Failed to retrieve tasks.",
            },
            {
              status: 500,
            },
          );
        }

        if (!tasks || tasks.length === 0) {
          return Response.json({
            success: true,
            message: "No task reminders are due.",
            processed: 0,
          });
        }

        const functionUrl = `${
          Deno.env.get("SUPABASE_URL")
        }/functions/v1/send-task-notification`;

        const serviceKey = Deno.env.get(
          "SUPABASE_SERVICE_ROLE_KEY",
        );

        if (!serviceKey) {
          return Response.json(
            {
              error: "Supabase service role key is not configured.",
            },
            {
              status: 500,
            },
          );
        }

        let processed = 0;

        for (const task of tasks) {
          // Get this user's reminder preference.
          const {
            data: profile,
            error: profileError,
          } = await supabase
            .from("profiles")
            .select("task_reminder_minutes")
            .eq("id", task.user_id)
            .maybeSingle();

          if (profileError) {
            console.error(
              "Failed to retrieve reminder preference:",
              profileError,
            );

            continue;
          }

          // Default to 10 minutes if no preference exists.
          const reminderMinutes =
            profile?.task_reminder_minutes ?? 10;

          const dueDate = new Date(
            task.due_date,
          );

          const reminderTime = new Date(
            dueDate.getTime() -
              reminderMinutes * 60 * 1000,
          );

          // If the reminder time has not arrived yet,
          // wait for a future cron run.
          //
          // If the reminder time has already passed,
          // continue processing. This is what allows
          // newly-created tasks inside the reminder window
          // to receive their notification immediately.
          if (
            reminderTime.getTime() >
            now.getTime()
          ) {
            continue;
          }

          // Calculate how much time remains until
          // the actual task due time.
          const remainingMilliseconds =
            dueDate.getTime() -
            now.getTime();

          const remainingMinutes =
            Math.max(
              0,
              Math.ceil(
                remainingMilliseconds /
                  (60 * 1000),
              ),
            );

          // Create a notification type based on the
          // user's current reminder interval.
          //
          // Examples:
          // task_reminder_5
          // task_reminder_10
          // task_reminder_15
          // task_reminder_30
          const notificationType =
            `task_reminder_${reminderMinutes}`;

          // Check whether this task has already received
          // this reminder.
          //
          // For the old 10-minute system, also recognize
          // the previous "10_minute_reminder" record.
          const notificationTypes =
            reminderMinutes === 10
              ? [
                  notificationType,
                  "10_minute_reminder",
                ]
              : [notificationType];

          const {
            data: existingNotification,
            error: notificationCheckError,
          } = await supabase
            .from("task_notifications")
            .select("id")
            .eq(
              "task_id",
              task.id,
            )
            .in(
              "notification_type",
              notificationTypes,
            )
            .maybeSingle();

          if (notificationCheckError) {
            console.error(
              "Failed to check notification:",
              notificationCheckError,
            );

            continue;
          }

          // Do not send the same reminder twice.
          if (existingNotification) {
            continue;
          }

          // Use the actual remaining time in the notification
          // message when a task was created after its normal
          // reminder point.
          const notificationBody =
            remainingMinutes > 0
              ? `${task.title} is due in ${remainingMinutes} minute${
                  remainingMinutes === 1
                    ? ""
                    : "s"
                }.`
              : `${task.title} is due now.`;

          const response = await fetch(
            functionUrl,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",

                "apikey": serviceKey,
              },

              body: JSON.stringify({
                user_id: task.user_id,

                title: "Task Reminder",

                body: notificationBody,
              }),
            },
          );

          const result =
            await response.json();

          if (!response.ok) {
            console.error(
              "Failed to send task notification:",
              result,
            );

            continue;
          }

          // Record the notification using the
          // user's current reminder interval.
          const {
            error: recordError,
          } = await supabase
            .from("task_notifications")
            .insert({
              task_id: task.id,

              notification_type:
                notificationType,
            });

          if (recordError) {
            console.error(
              "Failed to record notification:",
              recordError,
            );

            continue;
          }

          processed++;
        }

        return Response.json({
          success: true,

          message:
            "Task reminders processed.",

          found: tasks.length,

          processed,
        });
      } catch (error) {
        console.error(
          "Task reminder error:",
          error,
        );

        return Response.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Unknown error",
          },
          {
            status: 500,
          },
        );
      }
    },
  ),
};

