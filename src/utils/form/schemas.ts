import { JSONContent } from "@tiptap/core";
import dayjs from "dayjs";
import { z } from "zod";
import { task_priority, task_status } from "~/db/schema";

export const TaskFormSchema = z.object({
  title: z.string().min(1, "Title must be at least 1 character long"),
  description: z.string().min(1, "Description must be at least 1 character long"),
  dueDate: z
    .string()
    .or(z.date())
    .transform((value) => new Date(value))
    .refine((value) => dayjs(value).diff(dayjs(), "day") >= 0, "Due date must be today or later"),
  content: z.any().transform((value) => {
    try {
      return JSON.parse(value) as JSONContent;
    } catch (e) {
      return {} as JSONContent;
    }
  }),
  priority: z.enum(task_priority.enumValues),
  status: z.enum(task_status.enumValues),
});
export const EditTaskFormSchema = TaskFormSchema.merge(
  z.object({
    id: z.string().uuid(),
  })
);
