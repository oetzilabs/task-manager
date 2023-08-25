import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { CopyPlus, PenLine, Trash, X } from "lucide-solid";
import { A } from "solid-start";
import { TaskSelect, users_to_tasks, tasks } from "../db/schema";
import { PriorityColors } from "../utils/colors";
import { getSession } from "@auth/solid-start";
import { createServerAction$ } from "solid-start/server";
import { db } from "../db";
import { authOpts } from "../routes/api/auth/[...solidauth]";
import { eq } from "drizzle-orm";
import { Show } from "solid-js";
dayjs.extend(advancedFormat);

interface TaskProps {
  task: TaskSelect;
  withDelete?: boolean;
  withEdit?: boolean;
}

export const Task = (props: TaskProps) => {
  const [duplicationState, duplicateTask] = createServerAction$(
    async (id: string, { request }) => {
      const session = await getSession(request, authOpts);
      if (!session) {
        throw new Error("Session not found");
      }
      const user = await db.query.users.findFirst({
        where(fields, operators) {
          return operators.eq(fields.email, session.user!.email!);
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      const task = await db.query.tasks.findFirst({
        where(fields, operators) {
          return operators.eq(fields.id, id);
        },
      });
      if (!task) {
        throw new Error("Task not found");
      }
      const [newTask] = await db
        .insert(tasks)
        .values({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status,
        })
        .returning();
      if (!newTask) {
        throw new Error("Some error occured");
      }
      await db.insert(users_to_tasks).values({ user_id: user.id, task_id: newTask.id }).returning();
      return newTask;
    },
    {
      invalidate: () => ["tasks"],
    }
  );
  const [deletionState, deleteTask] = createServerAction$(
    async (id: string, { request }) => {
      const session = await getSession(request, authOpts);
      if (!session) {
        throw new Error("Session not found");
      }
      const user = await db.query.users.findFirst({
        where(fields, operators) {
          return operators.eq(fields.email, session.user!.email!);
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      const task = await db.query.tasks.findFirst({
        where(fields, operators) {
          return operators.eq(fields.id, id);
        },
      });
      if (!task) {
        throw new Error("Task not found");
      }
      const [t] = await db
        .update(tasks)
        .set({
          status: "archived",
        })
        .where(eq(tasks.id, task.id))
        .returning();
      return t;
    },
    {
      invalidate: () => ["tasks"],
    }
  );
  return (
    <div class="w-full p-4 border rounded-sm">
      <div class="w-full flex flex-row justify-between">
        <div class="flex-1 flex flex-col gap-2">
          <div class="flex flex-row gap-1">
            <A href={`/tasks/${props.task.id}`}>
              <h2 class="text-xl font-bold hover:underline underline-offset-2">{props.task.title}</h2>
            </A>
          </div>
          <div class="text-xs text-neutral-400">{dayjs(props.task.dueDate).format("Do MMMM YYYY")}</div>
          <div class="text-sm">{props.task.description}</div>
          <div class="flex flex-row gap-2 ">
            <button
              class="border flex gap-1 items-center bg-white text-black py-1 px-2 rounded-sm hover:bg-neutral-100"
              disabled={duplicationState.pending}
              onClick={() => {
                duplicateTask(props.task.id);
              }}
            >
              <CopyPlus size={16} />
              <span>Duplicate</span>
            </button>
            <Show when={props.withEdit}>
              <A href={`/tasks/${props.task.id}/edit`}>
                <button class="flex gap-1 items-center bg-black text-white py-1 px-2 rounded-sm hover:bg-neutral-900">
                  <PenLine size={16} />
                  <span>Edit</span>
                </button>
              </A>
            </Show>
            <Show when={props.task.status !== "archived" && props.withDelete}>
              <button
                class="flex gap-1 items-center bg-red-500 text-white py-1 px-2 rounded-sm hover:bg-red-600"
                disabled={deletionState.pending}
                onClick={() => {
                  deleteTask(props.task.id);
                }}
              >
                <Trash size={16} />
                <span>Delete</span>
              </button>
            </Show>
          </div>
        </div>
        <div class="relative w-max flex flex-col gap-2 items-end">
          <div class="flex flex-row gap-2 items-center">
            <div
              class="w-3 h-3 rounded-full"
              style={{
                ["background-color"]: PriorityColors[props.task.priority],
              }}
            />
            <div
              class="text-sm"
              style={{
                color: PriorityColors[props.task.priority],
              }}
            >
              {props.task.priority}
            </div>
          </div>
          <div class="text-xs text-neutral-400">{props.task.status}</div>
        </div>
      </div>
    </div>
  );
};
