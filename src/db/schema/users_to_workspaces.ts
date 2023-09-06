import { relations } from "drizzle-orm";
import { pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { workspaces } from "./workspace";
import { users } from "./user";

export const users_to_workspaces = pgTable(
  "users_to_workspaces",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => users.id),
    workspace_id: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    removedAt: timestamp("removed_at", { mode: "date" }),
  },
  (t) => ({
    pk: primaryKey(t.user_id, t.workspace_id),
  })
);

export type UsersToWorkspaces = typeof users_to_workspaces.$inferSelect;
export type NewUsersToWorkspaces = typeof users_to_workspaces.$inferInsert;

export const usersToWorkspacesRelations = relations(users_to_workspaces, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [users_to_workspaces.workspace_id],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [users_to_workspaces.user_id],
    references: [users.id],
  }),
}));
