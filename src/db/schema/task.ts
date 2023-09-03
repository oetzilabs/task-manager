import { InferSelectModel, relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users_to_tasks } from "./users_to_tasks";
import { requirements } from "./requirement";

export const task_status = pgEnum("task_status", ["incomplete", "in progress", "complete", "archived", "on hold"]);
export type TaskStatus = (typeof task_status.enumValues)[number];
export const task_priority = pgEnum("task_priority", ["low", "medium", "high"]);
export type TaskPriority = (typeof task_priority.enumValues)[number];

export const tasks = pgTable("task", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("dueDate", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }),
  removedAt: timestamp("removed_at", { mode: "date" }),
  status: task_status("status").notNull(),
  priority: task_priority("priority").notNull(),
});

export const task_relations = relations(tasks, ({ many, one }) => ({
  users_to_tasks: many(users_to_tasks),
  tasks_to_requirements: many(requirements),
}));

export type TaskSelect = InferSelectModel<typeof tasks>;
