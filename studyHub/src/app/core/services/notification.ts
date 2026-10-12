import { Injectable } from "@angular/core";

import { SupabaseService } from "./supabase";

export interface TaskNotification {
    id: string;
    taskId: string;
    notificationType: string;
    sentAt: string;
    read: boolean;

    task: {
        title: string;
        dueDate: string;
        priority: string;
        completed: boolean;
    };
}

@Injectable({
    providedIn: "root",
})
export class NotificationService {
    constructor(
        private supabase: SupabaseService,
    ) {}

    async getTaskNotifications(): Promise<TaskNotification[]> {
        const {
            data: { user },
            error: userError,
        } = await this.supabase.client.auth.getUser();

        if (userError) {
            throw userError;
        }

        if (!user) {
            return [];
        }

        const { data, error } = await this.supabase.client
            .from("task_notifications")
            .select(`
        id,
        task_id,
        notification_type,
        sent_at,
        read,
        tasks!inner (
          title,
          due_date,
          priority,
          completed
        )
      `)
            .eq("tasks.user_id", user.id)
            .order("sent_at", {
                ascending: false,
            });

        if (error) {
            throw error;
        }

        return (data ?? []).map((notification: any) => ({
            id: notification.id,
            taskId: notification.task_id,
            notificationType: notification.notification_type,
            sentAt: notification.sent_at,
            read: notification.read,

            task: {
                title: notification.tasks.title,
                dueDate: notification.tasks.due_date,
                priority: notification.tasks.priority,
                completed: notification.tasks.completed,
            },
        }));
    }

    async getUnreadNotificationCount(): Promise<number> {
        const {
            data: { user },
            error: userError,
        } = await this.supabase.client.auth.getUser();

        if (userError) {
            throw userError;
        }

        if (!user) {
            return 0;
        }

        const { count, error } = await this.supabase.client
            .from("task_notifications")
            .select("id, tasks!inner(user_id)", {
            count: "exact",
            head: true,
            })
            .eq("tasks.user_id", user.id)
            .eq("read", false);

        if (error) {
            throw error;
        }

        return count ?? 0;
    }

    async markAsRead(notificationId: string): Promise<void> {
        const { error } = await this.supabase.client
            .from("task_notifications")
            .update({
                read: true,
            })
            .eq("id", notificationId);

        if (error) {
            throw error;
        }
    }

    async markAllAsRead(): Promise<void> {
        const {
            data: { user },
            error: userError,
        } = await this.supabase.client.auth.getUser();

        if (userError) {
            throw userError;
        }

        if (!user) {
            return;
        }

        const { error } = await this.supabase.client
            .from("task_notifications")
            .update({
                read: true,
            })
            .eq("read", false)
            .in(
                "task_id",
                (
                    await this.supabase.client
                        .from("tasks")
                        .select("id")
                        .eq("user_id", user.id)
                ).data?.map((task) => task.id) ?? [],
            );

        if (error) {
            throw error;
        }
    }
}
