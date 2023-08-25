import { z } from "zod";
import { task_priority, task_status } from "../../db/schema";
import dayjs from "dayjs";

export const TaskFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  dueDate: z
    .string()
    .or(z.date())
    .transform((value) => new Date(value))
    .refine((value) => dayjs(value).diff(dayjs(), "day") >= 0, "Due date must be today or later"),
  priority: z.enum(task_priority.enumValues),
  status: z.enum(task_status.enumValues),
});
