import { InferSelectModel, relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tasks } from "./task";

export const requirement_status = pgEnum("requirement_status", [
  "incomplete",
  "in progress",
  "complete",
  "archived",
  "on hold",
]);
export type RequirementStatus = (typeof requirement_status.enumValues)[number];

export const requirement_priority = pgEnum("requirement_priority", ["low", "medium", "high"]);
export type RequirementPriority = (typeof requirement_priority.enumValues)[number];

export const requirements = pgTable("requirement", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("dueDate", { mode: "date" }).notNull(),
  status: requirement_status("status").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }),
  removedAt: timestamp("removed_at", { mode: "date" }),
  priority: requirement_priority("priority").notNull(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id),
});

export const requirement_relations = relations(requirements, ({ one }) => ({
  task: one(tasks, {
    fields: [requirements.taskId],
    references: [tasks.id],
  }),
}));

export type RequirementSelect = InferSelectModel<typeof requirements>;
