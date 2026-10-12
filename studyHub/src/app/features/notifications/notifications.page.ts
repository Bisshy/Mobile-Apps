import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";

import { CommonModule, DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import {
  IonContent,
  IonButton,
} from "@ionic/angular";

import {
  NotificationService,
  TaskNotification,
} from "../../core/services/notification";

@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.page.html",
  styleUrls: ["./notifications.page.scss"],
  imports: [
    IonContent,
    IonButton,
    CommonModule,
    DatePipe,
  ],
})
export class NotificationsPage implements OnInit {
  notifications: TaskNotification[] = [];

  loading = true;

  errorMessage = "";

  get hasUnreadNotifications(): boolean {
    return this.notifications.some(
      (notification) => !notification.read,
    );
  }

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadNotifications();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadNotifications();
  }

  async loadNotifications(): Promise<void> {
    this.loading = true;
    this.errorMessage = "";

    try {
      this.notifications =
        await this.notificationService.getTaskNotifications();
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error,
      );

      this.errorMessage =
        "Unable to load your notifications.";
    } finally {
      this.loading = false;

      this.changeDetectorRef.detectChanges();
    }
  }

  getNotificationTitle(
    notification: TaskNotification,
  ): string {
    if (
      notification.notificationType.startsWith(
        "task_reminder",
      ) ||
      notification.notificationType ===
        "10_minute_reminder"
    ) {
      return "Task Reminder";
    }

    return "Study Hub Notification";
  }

  getNotificationMessage(
    notification: TaskNotification,
  ): string {
    const type =
      notification.notificationType;

    if (type.startsWith("task_reminder_")) {
      const minutes = type.replace(
        "task_reminder_",
        "",
      );

      return `${notification.task.title} is due in ${minutes} minutes.`;
    }

    if (
      type === "10_minute_reminder"
    ) {
      return `${notification.task.title} is due in 10 minutes.`;
    }

    return `You have an update about ${notification.task.title}.`;
  }

  getPriorityLabel(
    priority: string,
  ): string {
    return priority;
  }

 async openTask(
      notification: TaskNotification,
  ): Promise<void> {
      try {
          if (!notification.read) {
              await this.notificationService.markAsRead(
                  notification.id,
              );

              notification.read = true;

              this.changeDetectorRef.detectChanges();
          }
      } catch (error) {
          console.error(
              "Failed to mark notification as read:",
              error,
          );
      }

      this.router.navigate(
          ["/tasks"],
          {
              queryParams: {
                  taskId: notification.taskId,
              },
          },
      );
  }

  async markAllAsRead(): Promise<void> {
    try {
      await this.notificationService.markAllAsRead();

      this.notifications =
        this.notifications.map(
          (notification) => ({
            ...notification,
            read: true,
          }),
        );

      this.changeDetectorRef.detectChanges();
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error,
      );
    }
  }

  goBack(): void {
    this.router.navigate([
      "/dashboard",
    ]);
  }
}