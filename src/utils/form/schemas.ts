import dayjs from "dayjs";
import { z } from "zod";
import { requirement_priority, requirement_status, task_priority, task_status } from "~/db/schema";

export const TaskRequirementFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  dueDate: z
    .string()
    .or(z.date())
    .transform((value) => new Date(value))
    .refine((value) => dayjs(value).diff(dayjs(), "day") >= 0, "Due date must be today or later"),
  status: z.enum(requirement_status.enumValues),
  priority: z.enum(requirement_priority.enumValues),
});

export const TaskFormSchema = z.object({
  title: z.string().min(1, "Title must be at least 1 character long"),
  description: z.string().min(1, "Description must be at least 1 character long"),
  dueDate: z
    .string()
    .or(z.date())
    .transform((value) => dayjs(value).toDate())
    .refine((value) => dayjs(value).diff(dayjs(), "day") >= 0, "Due date must be today or later"),
  priority: z.enum(task_priority.enumValues),
  status: z.enum(task_status.enumValues),
});

export const EditTaskFormSchema = z
  .object({
    id: z.string().uuid(),
  })
  .merge(TaskFormSchema);
