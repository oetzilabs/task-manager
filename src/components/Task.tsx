import { getSession } from "@auth/solid-start";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { eq } from "drizzle-orm";
import { Show } from "solid-js";
import { A } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { CopyPlus } from "~/components/icons/copy-plus";
import { PenLine } from "~/components/icons/penline";
import { Trash } from "~/components/icons/trash";
import { PriorityColors } from "~/utils/colors";
import { db } from "../db";
import { TaskSelect, tasks, users_to_tasks } from "../db/schema";
import { authOpts } from "../routes/api/auth/[...solidauth]";
import { Button } from "./Button";
import { Calendar } from "./icons/calendar";
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
          updatedAt: new Date(),
          removedAt: new Date(),
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
    <div class="w-full p-4 border border-neutral-200 bg-neutral-50 rounded-sm dark:border-neutral-900 dark:bg-neutral-950">
      <div class="w-full flex flex-col">
        <div class="w-full flex flex-col gap-2">
          <div class="w-full flex flex-row gap-2 justify-between">
            <div class="flex flex-1 flex-row gap-2 items-center">
              <div class="relative w-max flex flex-col gap-2">
                <div class="flex flex-row gap-2 items-center">
                  <div class="flex flex-row gap-1 items-center select-none">
                    <div class="text-xs text-neutral-400">
                      <Calendar size={14} />
                    </div>
                    <div class="text-xs text-neutral-400">Due</div>
                    <div class="text-xs text-neutral-400">{dayjs(props.task.dueDate).format("Do MMMM YYYY")}</div>
                  </div>
                </div>
                <div class="w-max flex flex-row gap-2 items-center select-none">
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
                  <div class="text-xs text-neutral-400">{props.task.status}</div>
                </div>
              </div>
            </div>
            <div class="flex flex-row gap-1 h-min">
              <Button.Tertiary
                disabled={duplicationState.pending}
                onClick={() => {
                  duplicateTask(props.task.id);
                }}
                class="border-none !p-2"
              >
                <CopyPlus size={16} />
                <span class="sr-only">Duplicate</span>
              </Button.Tertiary>
              <Show when={props.withEdit}>
                <A href={`/tasks/${props.task.id}/edit`}>
                  <Button.Tertiary class="border-none !p-2">
                    <PenLine size={16} />
                    <span class="sr-only">Edit</span>
                  </Button.Tertiary>
                </A>
              </Show>
              <Show when={props.task.removedAt === null && props.withDelete}>
                <Button.Tertiary
                  disabled={deletionState.pending}
                  onClick={() => {
                    deleteTask(props.task.id);
                  }}
                  class="border-none !p-2 !text-red-500 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900 dark:hover:!text-white"
                >
                  <Trash size={16} />
                  <span class="sr-only">Delete</span>
                </Button.Tertiary>
              </Show>
            </div>
          </div>
          <div class="flex flex-row gap-1 dark:text-white">
            <A href={`/tasks/${props.task.id}`}>
              <h2 class="text-xl font-bold hover:underline underline-offset-2">{props.task.title}</h2>
            </A>
          </div>
          <div class="text-sm">{props.task.description}</div>
        </div>
      </div>
    </div>
  );
};
