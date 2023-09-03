import { RequirementPriority, TaskPriority } from "~/db/schema";

export const TaskPriorityColors: Record<TaskPriority, string> = {
  high: "#F87171",
  medium: "#FBBF24",
  low: "#34D399",
};

export const RequirementPriorityColors: Record<RequirementPriority, string> = {
  high: "#F87171",
  medium: "#FBBF24",
  low: "#34D399",
};
