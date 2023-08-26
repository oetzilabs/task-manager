import { pgTable, primaryKey, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";
import { tasks } from "./task";
import { relations } from "drizzle-orm";

export const users_to_tasks = pgTable(
  "users_to_tasks",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => users.id),
    task_id: uuid("task_id")
      .notNull()
      .references(() => tasks.id),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    removedAt: timestamp("removed_at", { mode: "date" }),
  },
  (t) => ({
    pk: primaryKey(t.user_id, t.task_id),
  })
);

export const usersToTasksRelations = relations(users_to_tasks, ({ one }) => ({
  task: one(tasks, {
    fields: [users_to_tasks.task_id],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [users_to_tasks.user_id],
    references: [users.id],
  }),
}));
