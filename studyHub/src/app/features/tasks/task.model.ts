export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  completedAt?: string | null;
}
