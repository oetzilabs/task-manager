import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users_to_workspaces } from "./users_to_workspaces";
import { tasks } from "./task";

export const workspaces = pgTable("workspace", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }),
  removedAt: timestamp("removed_at", { mode: "date" }),
});

export const workspace_relations = relations(workspaces, ({ many, one }) => ({
  users_to_workspaces: many(users_to_workspaces),
  tasks: many(tasks),
}));

export type WorkspaceSelect = typeof workspaces.$inferSelect;
