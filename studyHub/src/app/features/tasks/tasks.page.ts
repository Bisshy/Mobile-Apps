import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";

import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";

import { Task } from "./task.model";
import { TaskService } from "../../core/services/task";

import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonModal,
} from "@ionic/angular";

import { AppHeaderComponent } from "../../shared/components/app-header/app-header.component";

import { AddTaskComponent } from "../../shared/components/add-task/add-task.component";

import { SearchBarComponent } from "../../shared/components/app-search-bar/app-search-bar.component";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.page.html",
  styleUrls: ["./tasks.page.scss"],
  imports: [
    IonContent,
    IonButton,
    IonModal,
    IonCheckbox,
    CommonModule,
    FormsModule,
    AppHeaderComponent,
    AddTaskComponent,
    SearchBarComponent,
  ],
})
export class TasksPage implements OnInit, OnDestroy {
  isAddTaskModalOpen = false;
  isReopeningCompletedTask = false;

  searchTerm = "";

  tasks: Task[] = [];

  taskToEdit: Task | null = null;

  /*
   * ============================================================
   * NOTIFICATION TARGET
   * ============================================================
   *
   * Stores the task ID passed from the
   * Notifications page.
   */
  selectedTaskId: string | null = null;

  highlightedTaskId: string | null = null;

  /*
   * ============================================================
   * MOBILE SWIPE-TO-DELETE
   * ============================================================
   */
  private swipeStartX = 0;
  private swipeCurrentX = 0;
  private swipingTaskId: string | null = null;

  private taskSubscription: Subscription | null = null;

  constructor(
    public taskService: TaskService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    /*
     * ============================================================
     * LOAD TASKS
     * ============================================================
     */
    this.tasks = this.taskService.getTasks();

    this.taskSubscription = this.taskService.tasks$.subscribe(
      (tasks) => {
        this.tasks = tasks;

        this.changeDetectorRef.detectChanges();

        /*
         * If this page was opened from a notification,
         * wait until the task list has rendered and
         * then scroll to the related task.
         */
        if (this.selectedTaskId) {
          setTimeout(() => {
            this.scrollToSelectedTask();
          }, 100);
        }
      },
    );

    /*
     * ============================================================
     * READ NOTIFICATION TASK ID
     * ============================================================
     *
     * Notifications navigate here using:
     *
     * /tasks?taskId=<task-id>
     *
     * We use the snapshot because we only need the
     * value when this page is opened.
     */
    this.selectedTaskId = this.route.snapshot.queryParamMap.get(
      "taskId",
    );

    if (this.selectedTaskId) {
      setTimeout(() => {
        this.scrollToSelectedTask();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.taskSubscription?.unsubscribe();
  }

  /*
   * ============================================================
   * SCROLL TO NOTIFICATION TASK
   * ============================================================
   *
   * Finds the task card using its task ID and
   * smoothly scrolls it into view.
   */
  private scrollToSelectedTask(): void {
    if (!this.selectedTaskId) {
      return;
    }

    const element = document.getElementById(
      `task-${this.selectedTaskId}`,
    );

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    this.highlightedTaskId = this.selectedTaskId;

    setTimeout(() => {
      if (this.highlightedTaskId === this.selectedTaskId) {
        this.highlightedTaskId = null;
        this.changeDetectorRef.detectChanges();
      }
    }, 2500);
  }

  /*
   * ============================================================
   * ACTIVE TASKS
   * ============================================================
   *
   * Completed tasks are excluded.
   *
   * Tasks are ordered by their exact
   * due date and time.
   */
  get activeTasks(): Task[] {
    return this.sortTasksByDueDateTime(
      this.tasks.filter(
        (task) => !task.completed,
      ),
    );
  }

  /*
   * ============================================================
   * FILTERED ACTIVE TASKS
   * ============================================================
   *
   * Applies the shared search bar to
   * the already-loaded active tasks.
   *
   * No additional Supabase query is made.
   */
  get filteredActiveTasks(): Task[] {
    const searchTerm = this.searchTerm.trim().toLowerCase();

    if (!searchTerm) {
      return this.activeTasks;
    }

    return this.activeTasks.filter(
      (task) =>
        this.getTaskSearchText(task).includes(
          searchTerm,
        ),
    );
  }

  /*
   * ============================================================
   * COMPLETED TASKS
   * ============================================================
   *
   * The Tasks page keeps the full
   * completed task history.
   *
   * Most recently completed tasks
   * appear first.
   */
  get completedTasks(): Task[] {
    return [...this.tasks]
      .filter(
        (task) => task.completed,
      )
      .sort(
        (a, b) => {
          const aCompletedTime = a.completedAt
            ? new Date(
              a.completedAt,
            ).getTime()
            : 0;

          const bCompletedTime = b.completedAt
            ? new Date(
              b.completedAt,
            ).getTime()
            : 0;

          return (
            bCompletedTime -
            aCompletedTime
          );
        },
      );
  }

  /*
   * ============================================================
   * FILTERED COMPLETED TASKS
   * ============================================================
   *
   * Applies the shared search bar to
   * the completed task history.
   *
   * No additional Supabase query is made.
   */
  get filteredCompletedTasks(): Task[] {
    const searchTerm = this.searchTerm.trim().toLowerCase();

    if (!searchTerm) {
      return this.completedTasks;
    }

    return this.completedTasks.filter(
      (task) =>
        this.getTaskSearchText(task).includes(
          searchTerm,
        ),
    );
  }

  /*
   * ============================================================
   * TASK SEARCH TEXT
   * ============================================================
   *
   * The search can match:
   *
   * - Task title
   * - Priority
   * - Stored due date
   * - Local date
   * - Local time
   */
  private getTaskSearchText(
    task: Task,
  ): string {
    return [
      task.title,
      task.priority,
      task.dueDate,
      new Date(
        task.dueDate,
      ).toLocaleDateString(),
      new Date(
        task.dueDate,
      ).toLocaleTimeString(),
    ]
      .join(" ")
      .toLowerCase();
  }

  /*
   * ============================================================
   * SORT ACTIVE TASKS
   * ============================================================
   *
   * Exact due date/time is the
   * primary ordering.
   *
   * Priority is used only when two
   * tasks have the same date/time.
   */
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
        const dateTimeDifference =
          new Date(
            a.dueDate,
          ).getTime() -
          new Date(
            b.dueDate,
          ).getTime();

        if (
          dateTimeDifference !== 0
        ) {
          return dateTimeDifference;
        }

        return (
          priorityOrder[a.priority] -
          priorityOrder[b.priority]
        );
      },
    );
  }

  /*
   * ============================================================
   * COMPLETE AN ACTIVE TASK
   * ============================================================
   */
  toggleTask(
    taskId: string,
  ): void {
    this.taskService.toggleTask(
      taskId,
    );
  }

  /*
   * ============================================================
   * REOPEN A COMPLETED TASK
   * ============================================================
   *
   * We intentionally do NOT call
   * toggleTask() here.
   *
   * The task must first go through
   * the Edit Task flow.
   */
  reopenCompletedTask(
    task: Task,
  ): void {
    this.taskToEdit = {
      ...task,
    };

    this.isReopeningCompletedTask = true;

    this.isAddTaskModalOpen = true;
  }

  /*
   * ============================================================
   * OPEN ADD TASK MODAL
   * ============================================================
   */
  openAddTask(): void {
    this.taskToEdit = null;

    this.isReopeningCompletedTask = false;

    this.isAddTaskModalOpen = true;
  }

  /*
   * ============================================================
   * OPEN NORMAL EDIT MODAL
   * ============================================================
   */
  openEditTask(
    task: Task,
  ): void {
    this.taskToEdit = task;

    this.isReopeningCompletedTask = false;

    this.isAddTaskModalOpen = true;
  }

  /*
   * ============================================================
   * CLOSE TASK MODAL
   * ============================================================
   */
  closeTaskModal(): void {
    this.isAddTaskModalOpen = false;

    this.taskToEdit = null;

    this.isReopeningCompletedTask = false;
  }

  /*
   * ============================================================
   * MOBILE SWIPE — TOUCH START
   * ============================================================
   *
   * Records where the user's finger
   * started.
   */
  onTaskTouchStart(
    event: TouchEvent,
    taskId: string,
  ): void {
    if (event.touches.length !== 1) {
      return;
    }

    this.swipeStartX =
      event.touches[0].clientX;

    this.swipeCurrentX =
      this.swipeStartX;

    this.swipingTaskId = taskId;
  }

  /*
   * ============================================================
   * MOBILE SWIPE — TOUCH MOVE
   * ============================================================
   *
   * Moves the task card to the left
   * while the user swipes.
   */
  onTaskTouchMove(
    event: TouchEvent,
    taskId: string,
  ): void {
    if (
      this.swipingTaskId !== taskId ||
      event.touches.length !== 1
    ) {
      return;
    }

    this.swipeCurrentX =
      event.touches[0].clientX;

    const swipeDistance =
      this.swipeCurrentX -
      this.swipeStartX;

    /*
     * Only allow a left swipe.
     */
    if (swipeDistance < 0) {
      const element =
        document.getElementById(
          `task-${taskId}`,
        );

      if (element) {
        const translateX =
          Math.max(
            swipeDistance,
            -120,
          );

        element.style.transform =
          `translateX(${translateX}px)`;
      }
    }
  }

  /*
   * ============================================================
   * MOBILE SWIPE — TOUCH END
   * ============================================================
   *
   * If the user swipes far enough,
   * delete the task.
   *
   * Otherwise, return the card
   * to its original position.
   */
  onTaskTouchEnd(
    _event: TouchEvent,
    taskId: string,
  ): void {
    if (
      this.swipingTaskId !== taskId
    ) {
      return;
    }

    const swipeDistance =
      this.swipeCurrentX -
      this.swipeStartX;

    const element =
      document.getElementById(
        `task-${taskId}`,
      );

    /*
     * Delete threshold:
     * 80px to the left.
     */
    if (swipeDistance <= -80) {
      if (element) {
        element.style.transform =
          "translateX(-100%)";
      }

      setTimeout(() => {
        this.deleteTask(taskId);
      }, 180);
    } else if (element) {
      /*
       * Not far enough.
       * Return the card to its
       * original position.
       */
      element.style.transform =
        "translateX(0)";
    }

    this.swipeStartX = 0;
    this.swipeCurrentX = 0;
    this.swipingTaskId = null;
  }

  /*
   * ============================================================
   * DELETE TASK
   * ============================================================
   */
  deleteTask(
    taskId: string,
  ): void {
    this.taskService.deleteTask(
      taskId,
    );
  }
}