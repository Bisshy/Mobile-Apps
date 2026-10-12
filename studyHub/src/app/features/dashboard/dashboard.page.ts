import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";

import { CommonModule, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";

import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonModal,
  IonProgressBar,
} from "@ionic/angular";

import { AppHeaderComponent } from "../../shared/components/app-header/app-header.component";
import { AddTaskComponent } from "../../shared/components/add-task/add-task.component";
import { Task } from "../tasks/task.model";
import { TaskService } from "../../core/services/task";
import { Router } from "@angular/router";

import { SupabaseAuthService } from "../../core/services/supabase-auth";
import {
  UserProfile,
  UserProfileService,
} from "../../core/services/user-profile";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.page.html",
  styleUrls: ["./dashboard.page.scss"],
  imports: [
    IonContent,
    IonButton,
    IonProgressBar,
    IonCheckbox,
    CommonModule,
    FormsModule,
    IonModal,
    AddTaskComponent,
    AppHeaderComponent,
    DatePipe,
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
  isAddTaskModalOpen = false;

  tasks: Task[] = [];

  studentName = "Student";

  userProfile: UserProfile | null = null;

  private authSubscription:
    | ReturnType<
      SupabaseAuthService["onAuthStateChange"]
    >
    | null = null;

  private taskSubscription: Subscription | null = null;

  constructor(
    public taskService: TaskService,
    private router: Router,
    private supabaseAuthService: SupabaseAuthService,
    private userProfileService: UserProfileService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.tasks = this.taskService.getTasks();

    this.taskSubscription = this.taskService.tasks$.subscribe(
      (tasks) => {
        this.tasks = tasks;

        this.changeDetectorRef.detectChanges();
      },
    );

    this.authSubscription = this.supabaseAuthService.onAuthStateChange(
      async (session) => {
        const user = session?.user;

        if (!user) {
          console.log(
            "No authenticated user found.",
          );

          return;
        }

        console.log(
          "Authenticated user:",
          user.id,
        );

        console.log(
          "Getting user profile from Supabase...",
        );

        try {
          this.userProfile = await this.userProfileService.getProfile(
            user.id,
          );

          console.log(
            "Current user profile:",
            this.userProfile,
          );

          if (this.userProfile) {
            this.studentName = this.userProfile.username;

            this.changeDetectorRef.detectChanges();
          }
        } catch (error) {
          console.error(
            "Error loading user profile:",
            error,
          );
        }
      },
    );
  }

  ngOnDestroy(): void {
    this.authSubscription
      ?.data
      .subscription
      .unsubscribe();

    this.taskSubscription?.unsubscribe();
  }

  get greeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  }

  toggleTask(taskId: string): void {
    this.taskService.toggleTask(taskId);
  }

  get todayTasks(): Task[] {
    const today = new Date();

    return this.tasks.filter((task) =>
      this.isSameLocalDate(
        new Date(task.dueDate),
        today,
      )
    );
  }

  get dashboardTodayTasks(): Task[] {
    return this.sortTasksByDueDateTime(
      this.todayTasks.filter(
        (task) => !task.completed,
      ),
    ).slice(0, 3);
  }

  get upcomingTasks(): Task[] {
    const today = new Date();

    // Get ALL active tasks for today.
    const activeTodayTasks = this.sortTasksByDueDateTime(
      this.todayTasks.filter(
        (task) => !task.completed,
      ),
    );

    // Anything beyond the first 3 today's tasks
    // becomes eligible for Upcoming.
    const remainingTodayTasks = activeTodayTasks.slice(3);

    // Get active tasks scheduled after today.
    const futureTasks = this.tasks.filter(
      (task) => {
        const taskDate = new Date(task.dueDate);

        return (
          !task.completed &&
          !this.isSameLocalDate(
            taskDate,
            today,
          ) &&
          taskDate.getTime() > today.getTime()
        );
      },
    );

    return this.sortTasksByDueDateTime([
      ...remainingTodayTasks,
      ...futureTasks,
    ]).slice(0, 3);
  }

  get completedTasks(): Task[] {
    return [...this.tasks]
      .filter(
        (task) => task.completed,
      )
      .sort(
        (a, b) => {
          const aCompletedTime = a.completedAt
            ? new Date(a.completedAt).getTime()
            : 0;

          const bCompletedTime = b.completedAt
            ? new Date(b.completedAt).getTime()
            : 0;

          return bCompletedTime - aCompletedTime;
        },
      )
      .slice(0, 5);
  }

  private sortTasksByDueDateTime(
    tasks: Task[],
  ): Task[] {
    const priorityOrder: Record<
      Task["priority"],
      number
    > = {
      High: 1,
      Medium: 2,
      Low: 3,
    };

    return [...tasks].sort(
      (a, b) => {
        const dateTimeDifference = new Date(a.dueDate).getTime() -
          new Date(b.dueDate).getTime();

        if (dateTimeDifference !== 0) {
          return dateTimeDifference;
        }

        return (
          priorityOrder[a.priority] -
          priorityOrder[b.priority]
        );
      },
    );
  }

  private isSameLocalDate(
    firstDate: Date,
    secondDate: Date,
  ): boolean {
    return (
      firstDate.getFullYear() ===
        secondDate.getFullYear() &&
      firstDate.getMonth() ===
        secondDate.getMonth() &&
      firstDate.getDate() ===
        secondDate.getDate()
    );
  }
  get completedTaskCount(): number {
    return this.todayTasks.filter(
      (task) => task.completed,
    ).length;
  }

  get progressPercentage(): number {
    if (this.todayTasks.length === 0) {
      return 0;
    }

    return (
      this.completedTaskCount /
      this.todayTasks.length
    );
  }

  get progressDisplay(): number {
    return Math.round(
      this.progressPercentage * 100,
    );
  }

  viewAllTasks(): void {
    this.router.navigate(["/tasks"]);
  }
}
