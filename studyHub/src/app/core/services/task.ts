import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { Task } from "../../features/tasks/task.model";

import { SupabaseService } from "./supabase";
import { SupabaseAuthService } from "./supabase-auth";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  private tasks: Task[] = [];

  private tasksSubject = new BehaviorSubject<Task[]>([]);

  tasks$ = this.tasksSubject.asObservable();

  // NEW: checks for overdue tasks every 60 seconds
  private overdueCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private supabaseAuthService: SupabaseAuthService,
  ) {
    this.supabaseAuthService.onAuthStateChange(
      (session) => {
        this.tasks = [];

        this.tasksSubject.next([]);

        // NEW: stop the previous timer when auth changes
        this.clearOverdueCheck();

        if (!session?.user) {
          return;
        }

        this.loadTasks(session.user.id);

        // NEW: check for overdue tasks every 60 seconds
        this.overdueCheckInterval = setInterval(() => {
          this.checkForOverdueTasks(
            session.user.id,
          );
        }, 60_000);
      },
    );
  }

  private async loadTasks(
    uid: string,
  ): Promise<void> {
    try {
      const {
        data,
        error,
      } = await this.supabaseService.client
        .from("tasks")
        .select("*")
        .eq("user_id", uid)
        .order("due_date", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      this.tasks = (data ?? []).map(
        (task) =>
          ({
            id: task.id,
            title: task.title,
            dueDate: task.due_date,
            priority: task.priority,
            completed: task.completed,

            // NEW
            completedAt: task.completed_at,
          }) as Task,
      );

      this.tasksSubject.next(
        [...this.tasks],
      );
    } catch (error) {
      console.error(
        "Error loading tasks:",
        error,
      );
    }
  }

  // NEW: automatically completes tasks
  // whose due date/time has passed.
  private async checkForOverdueTasks(
    uid: string,
  ): Promise<void> {
    try {
      const now = new Date().toISOString();

      const {
        data,
        error,
      } = await this.supabaseService.client
        .from("tasks")
        .update({
          completed: true,

          completed_at: now,
        })
        .eq("user_id", uid)
        .eq("completed", false)
        .lte("due_date", now)
        .select("id");

      if (error) {
        throw error;
      }

      // Only reload when something was actually
      // automatically completed.
      if (data && data.length > 0) {
        await this.loadTasks(uid);
      }
    } catch (error) {
      console.error(
        "Error checking overdue tasks:",
        error,
      );
    }
  }

  // NEW: safely clears the automatic timer
  private clearOverdueCheck(): void {
    if (
      this.overdueCheckInterval !== null
    ) {
      clearInterval(
        this.overdueCheckInterval,
      );

      this.overdueCheckInterval = null;
    }
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  async addTask(
    task: Omit<Task, "id">,
  ): Promise<void> {
    const user = await this.supabaseAuthService
      .getCurrentUser();

    if (!user) {
      throw new Error(
        "No authenticated user found.",
      );
    }

    const {
      error,
    } = await this.supabaseService.client
      .from("tasks")
      .insert({
        user_id: user.id,

        title: task.title,

        due_date: task.dueDate,

        priority: task.priority,

        completed: task.completed,

        // NEW
        completed_at: task.completedAt ?? null,
      });

    if (error) {
      throw error;
    }

    await this.loadTasks(
      user.id,
    );
  }

  async updateTask(
    updatedTask: Task,
  ): Promise<void> {
    const user = await this.supabaseAuthService
      .getCurrentUser();

    if (!user) {
      throw new Error(
        "No authenticated user found.",
      );
    }

    const {
      error,
    } = await this.supabaseService.client
      .from("tasks")
      .update({
        title: updatedTask.title,

        due_date: updatedTask.dueDate,

        priority: updatedTask.priority,

        completed: updatedTask.completed,

        // NEW
        completed_at: updatedTask.completed
          ? updatedTask.completedAt ??
            new Date().toISOString()
          : null,
      })
      .eq("id", updatedTask.id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    await this.loadTasks(
      user.id,
    );
  }

  async deleteTask(
    taskId: string,
  ): Promise<void> {
    const user = await this.supabaseAuthService
      .getCurrentUser();

    if (!user) {
      throw new Error(
        "No authenticated user found.",
      );
    }

    const {
      error,
    } = await this.supabaseService.client
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    await this.loadTasks(
      user.id,
    );
  }

  async toggleTask(
    taskId: string,
  ): Promise<void> {
    const user = await this.supabaseAuthService
      .getCurrentUser();

    if (!user) {
      throw new Error(
        "No authenticated user found.",
      );
    }

    const task = this.tasks.find(
      (task) => task.id === taskId,
    );

    if (!task) {
      return;
    }

    const newCompletedState = !task.completed;

    const {
      error,
    } = await this.supabaseService.client
      .from("tasks")
      .update({
        completed: newCompletedState,

        // NEW
        completed_at: newCompletedState ? new Date().toISOString() : null,
      })
      .eq("id", taskId)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    await this.loadTasks(
      user.id,
    );
  }
}
