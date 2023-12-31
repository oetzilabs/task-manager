import { getSession } from "@auth/solid-start";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { For, Show, createSignal } from "solid-js";
import { RouteDataFuncArgs, useRouteData } from "solid-start";
import { createServerAction$, createServerData$, redirect } from "solid-start/server";
import { z } from "zod";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Select } from "~/components/Select";
import { db } from "~/db";
import { task_priority, task_status, tasks } from "~/db/schema";
import { TaskPriority, TaskStatus } from "~/db/schema/task";
import { EditTaskFormSchema } from "~/utils/form/schemas";
import { authOpts } from "../../../../api/auth/[...solidauth]";

export const routeData = ({ params }: RouteDataFuncArgs) => {
  const task = createServerData$(
    async (p: string[]) => {
      const [_, __, wid, ___, ____, id] = p;
      const task = await db.query.tasks.findFirst({
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
  const [error, setError] = createSignal<any | null>(null);
  const task = useRouteData<typeof routeData>();
  const [formState, { Form }] = createServerAction$(
    async (formData: FormData, { request }) => {
      const session = await getSession(request, authOpts);
      if (!session) {
        throw new Error("Session not found");
      }
      const data = EditTaskFormSchema.parse(Object.fromEntries(formData.entries()));

      const user = await db.query.users.findFirst({
        where(fields, operators) {
          return operators.eq(fields.email, session.user!.email!);
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      const newData = Object.assign(data, { updatedAt: new Date() });
      const [task] = await db.update(tasks).set(newData).where(eq(tasks.id, data.id)).returning();

      if (task) {
        return redirect(`/tasks/${task.id}`);
      } else {
        throw new Error("Some error occured");
      }
    },
    {
      invalidate: ["workspaces", "workspace", task()?.workspace_id, "tasks", "task", task()?.id],
    }
  );

  let formRef: HTMLFormElement;
  return (
    <Show when={!task.loading && task()}>
      {(t) => (
        <Form class="w-full flex flex-col gap-4 p-4 text-black dark:text-white" ref={formRef!}>
          <input type="hidden" name="id" value={t().id} />
          <div>
            <h1 class="text-4xl font-bold">Edit Task</h1>
          </div>
          <div class="flex flex-col border dark:border-neutral-900 p-2 gap-2">
            <label class="flex flex-col gap-0.5">
              <span class="text-sm font-medium">Title</span>
              <Input
                name="title"
                disabled={formState.pending}
                type="text"
                placeholder="Title"
                autofocus
                value={t().title}
              />
            </label>
            <label class="flex flex-col gap-0.5">
              <span class="text-sm font-medium">Description</span>
              <Input
                disabled={formState.pending}
                name="description"
                type="text"
                placeholder="Description"
                value={t().description}
              />
            </label>
            <label class="flex flex-col gap-0.5">
              <span class="text-sm font-medium">Due Date</span>
              <Input
                disabled={formState.pending}
                name="dueDate"
                type="date"
                placeholder="Due Date"
                value={dayjs(t().dueDate).format("YYYY-MM-DD")}
              />
            </label>
            <Select<TaskPriority>
              name="priority"
              disabled={formState.pending}
              options={task_priority.enumValues}
              placeholder="Select a priority…"
              defaultValue={task_priority.enumValues[0]}
            >
              Priority
            </Select>
            <Select<TaskStatus>
              name="status"
              disabled={formState.pending}
              options={task_status.enumValues}
              placeholder="Select a status"
              defaultValue={task_status.enumValues[0]}
            >
              Status
            </Select>
            <Show when={error()}>
              {(e) => (
                <>
                  <For each={Object.keys(e().flatten().fieldErrors) as (keyof z.infer<typeof EditTaskFormSchema>)[]}>
                    {(key) => <span class="text-xs text-red-500">{e().formErrors.fieldErrors[key]}</span>}
                  </For>
                </>
              )}
            </Show>
          </div>
          <div class="flex w-full justify-between gap-2">
            <div class="flex w-full"></div>
            <div>
              <Button.Primary
                disabled={formState.pending}
                type="button"
                class="w-max bg-black text-white py-1 px-4 rounded-sm"
                onClick={() => {
                  const data = Object.fromEntries(new FormData(formRef).entries());
                  const validated = EditTaskFormSchema.safeParse(data);
                  if (!validated.success) {
                    setError(validated.error);
                  } else {
                    formRef?.submit();
                  }
                }}
              >
                Save
              </Button.Primary>
            </div>
          </div>
        </Form>
      )}
    </Show>
  );
};

export default Page;
