import { relations } from "drizzle-orm";
import { pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tasks } from "./task";
import { users } from "./user";

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

export type UsersToTasks = typeof users_to_tasks.$inferSelect;
export type NewUsersToTasks = typeof users_to_tasks.$inferInsert;

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
