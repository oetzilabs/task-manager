import { z } from "zod";
import { task_priority, task_status } from "../../db/schema";

export const TaskFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  dueDate: z
    .string()
    .or(z.date())
    .transform((value) => new Date(value))
    .refine((value) => new Date(value).getTime() > Date.now(), "Due date must be in the future"),
  priority: z.enum(task_priority.enumValues),
  status: z.enum(task_status.enumValues),
});
