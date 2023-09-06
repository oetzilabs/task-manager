import { getSession } from "@auth/solid-start";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { isNull } from "drizzle-orm";
import { For, Show } from "solid-js";
import { RouteDataFuncArgs, useRouteData } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import { Requirement } from "~/components/Requirement";
import { Task } from "~/components/Task";
import { db } from "~/db";
import { requirements } from "~/db/schema";
import { authOpts } from "../../../../api/auth/[...solidauth]";
dayjs.extend(advancedFormat);

export const routeData = ({ params }: RouteDataFuncArgs) => {
  const task = createServerData$(
    async (p: string[]) => {
      const [_, __, wid, ___, ____, id] = p;
      const task = await db.query.tasks.findFirst({
        with: {
          tasks_to_requirements: {
            where: (fields, operators) => isNull(fields.removedAt),
            with: {
              task: true,
            },
          },
        },
        where(fields, operators) {
          return operators.eq(fields.id, id);
        },
      });
      return task;
    },
    { key: () => ["workspaces", "workspace", params.wid, "tasks", "task", params.tid] }
  );
  return task;
};

export const Page = () => {
  const task = useRouteData<typeof routeData>();

  const [addRequirementState, addRequirement] = createServerAction$(
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
      const [newRequirement] = await db
        .insert(requirements)
        .values({
          taskId: task.id,
          description: "",
          dueDate: new Date(),
          priority: "low",
          status: "incomplete",
          title: "",
        })
        .returning();
      if (!newRequirement) {
        throw new Error("Some error occured");
      }
    },
    {
      invalidate: () => ["workspaces", "workspace", task()?.workspace_id, "tasks", "task", task()?.id],
    }
  );

  return (
    <div class="w-full flex flex-col gap-2 p-4">
      <Show when={task()}>
        {(t) => (
          <div class="flex flex-col gap-4">
            <div>
              <span class="text-3xl dark:text-white font-semibold">Task</span>
            </div>
            <Task task={t()} />
            <div>
              <span class="text-3xl dark:text-white font-semibold">Requirements</span>
            </div>
            <For
              fallback={
                <div class="w-full bg-black/[0.02] dark:bg-white/[0.05] dark:text-white/50 py-20 flex flex-col items-center justify-center gap-4">
                  <span>No requirements set</span>
                  <span class="text-xs text-neutral-400">
                    <button
                      class="hover:underline cursor-pointer underline-offset-2"
                      onClick={() => addRequirement(t().id)}
                      aria-disabled={addRequirementState.pending}
                    >
                      Add a requirement
                    </button>{" "}
                    to get started
                  </span>
                </div>
              }
              each={t().tasks_to_requirements}
            >
              {(r) => <Requirement requirement={r} wid={task()?.workspace_id ?? ""} />}
            </For>
          </div>
        )}
      </Show>
    </div>
  );
};

export default Page;
