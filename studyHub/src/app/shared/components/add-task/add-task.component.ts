import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";

import { FormsModule } from "@angular/forms";

import { Task } from "../../../features/tasks/task.model";

import { TaskService } from "../../../core/services/task";

import {
  AlertController,
  IonButton,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
} from "@ionic/angular";

@Component({
  selector: "app-add-task",
  templateUrl: "./add-task.component.html",
  styleUrls: ["./add-task.component.scss"],
  imports: [
    IonButton,
    IonInput,
    IonItem,
    IonSelect,
    IonSelectOption,
    FormsModule,
  ],
})
export class AddTaskComponent implements OnInit, OnChanges {
  @Input()
  taskToEdit: Task | null = null;

  @Input()
  isReopeningCompletedTask = false;

  @Output()
  close = new EventEmitter<void>();

  taskTitle = "";

  dueDate = "";

  dueTime = "";

  priority = "";

  constructor(
    private taskService: TaskService,
    private alertController: AlertController,
  ) {}

  ngOnInit(): void {
    this.loadTaskForEditing();
  }

  ngOnChanges(
    changes: SimpleChanges,
  ): void {
    if (
      changes["taskToEdit"] ||
      changes["isReopeningCompletedTask"]
    ) {
      this.loadTaskForEditing();
    }
  }

  private loadTaskForEditing(): void {
    if (!this.taskToEdit) {
      this.taskTitle = "";

      this.dueDate = "";

      this.dueTime = "";

      this.priority = "";

      return;
    }

    /*
     * Load the existing task title.
     */
    this.taskTitle = this.taskToEdit.title;

    const savedDueDate = new Date(
      this.taskToEdit.dueDate,
    );

    this.dueDate = savedDueDate
      .toISOString()
      .slice(0, 10);

    this.dueTime = savedDueDate
      .toTimeString()
      .slice(0, 5);

    this.priority = this.taskToEdit.priority;
  }

  closeModal(): void {
    this.close.emit();
  }

  async addTask(): Promise<void> {
    /*
     * ============================================================
     * VALIDATE DATE AND TIME
     * ============================================================
     *
     * Every task must have a valid
     * date and time.
     */
    if (
      !this.dueDate ||
      !this.dueTime
    ) {
      await this.showAlert(
        "You can only add a task with a future date and time.",
      );

      return;
    }

    const selectedDateTime = new Date(
      `${this.dueDate}T${this.dueTime}`,
    );

    const selectedTime =
      selectedDateTime.getTime();

    const currentTime =
      new Date().getTime();

    /*
     * Make sure the selected date/time
     * is valid.
     */
    if (
      Number.isNaN(selectedTime)
    ) {
      await this.showAlert(
        "Choose a valid date and time.",
      );

      return;
    }

    /*
     * ============================================================
     * SPECIAL REOPEN FLOW
     * ============================================================
     *
     * A completed task can only become
     * active again when its new due
     * date/time is in the future.
     */
    if (
      this.taskToEdit &&
      this.isReopeningCompletedTask
    ) {
      /*
       * The new date/time must be
       * strictly in the future.
       */
      if (
        selectedTime <= currentTime
      ) {
        await this.showAlert(
          "Choose a future date and time to reopen this task.",
        );

        return;
      }

      /*
       * Everything is valid.
       *
       * The completed task now becomes
       * an active task.
       */
      const reopenedTask: Task = {
        id: this.taskToEdit.id,

        title: this.taskTitle,

        dueDate:
          selectedDateTime.toISOString(),

        priority:
          this.priority as Task["priority"],

        completed: false,

        completedAt: null,
      };

      try {
        await this.taskService.updateTask(
          reopenedTask,
        );

        console.log(
          "Completed task reopened:",
          reopenedTask,
        );

        this.closeModal();
      } catch (error) {
        console.error(
          "Error reopening task:",
          error,
        );
      }

      return;
    }

    /*
     * ============================================================
     * NORMAL EDIT FLOW
     * ============================================================
     *
     * Existing active tasks must also
     * have a future date/time when
     * their date/time is changed.
     */
    if (this.taskToEdit) {
      /*
       * Do not allow an active task to
       * be edited with a past date/time.
       */
      if (
        !this.taskToEdit.completed &&
        selectedTime <= currentTime
      ) {
        await this.showAlert(
          "You can only set a task with a future date and time.",
        );

        return;
      }

      const updatedTask: Task = {
        id: this.taskToEdit.id,

        title: this.taskTitle,

        dueDate:
          selectedDateTime.toISOString(),

        priority:
          this.priority as Task["priority"],

        completed:
          this.taskToEdit.completed,

        completedAt:
          this.taskToEdit.completed
            ? this.taskToEdit.completedAt ??
              null
            : null,
      };

      try {
        await this.taskService.updateTask(
          updatedTask,
        );

        console.log(
          "Task updated:",
          updatedTask,
        );

        this.closeModal();
      } catch (error) {
        console.error(
          "Error updating task:",
          error,
        );
      }

      return;
    }

    /*
     * ============================================================
     * ADD NEW TASK
     * ============================================================
     *
     * New tasks must always have a
     * future date and time.
     */
    if (
      selectedTime <= currentTime
    ) {
      await this.showAlert(
        "You can only add a task with a future date and time.",
      );

      return;
    }

    const newTask: Omit<Task, "id"> = {
      title: this.taskTitle,

      dueDate:
        selectedDateTime.toISOString(),

      priority:
        this.priority as Task["priority"],

      completed: false,

      completedAt: null,
    };

    try {
      await this.taskService.addTask(
        newTask,
      );

      console.log(
        "New task:",
        newTask,
      );

      this.closeModal();
    } catch (error) {
      console.error(
        "Error adding task:",
        error,
      );
    }
  }

  private async showAlert(
    message: string,
  ): Promise<void> {
    const alert =
      await this.alertController.create({
        header: "Invalid date and time",

        message,

        buttons: [
          {
            text: "OK",
            role: "cancel",
          },
        ],
      });

    await alert.present();
  }
}