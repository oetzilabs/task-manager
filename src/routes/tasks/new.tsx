import { getSession } from "@auth/solid-start";
import { A } from "@solidjs/router";
import { For, Show, createSignal } from "solid-js";
import { ServerError, createServerAction$, redirect } from "solid-start/server";
import { z } from "zod";
import Protected from "~/components/Protected";
import { Select } from "~/components/Select";
import { db } from "~/db";
import { TipTap } from "../../components/TipTap";
import { task_priority, task_status, tasks, users_to_tasks } from "../../db/schema";
import { TaskPriority, TaskStatus } from "../../db/schema/task";
import { TaskFormSchema } from "../../utils/form/schemas";
import { authOpts } from "../api/auth/[...solidauth]";

export const { routeData, Page } = Protected((_) => {
  const [error, setError] = createSignal<any>(null);
  const [formState, { Form }] = createServerAction$(async (formData: FormData, { request }) => {
    const session = await getSession(request, authOpts);
    if (!session) {
      throw new Error("Session not found");
    }
    const data = TaskFormSchema.parse(Object.fromEntries(formData.entries()));

    const user = await db.query.users.findFirst({
      where(fields, operators) {
        return operators.eq(fields.email, session.user!.email!);
      },
    });
    if (!user) {
      throw new ServerError("User not found");
    }
    const [task] = await db
      .insert(tasks)
      .values({
        content: data.content,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        status: data.status,
      })
      .returning();
    await db.insert(users_to_tasks).values({ user_id: user.id, task_id: task.id }).returning();

    if (task) {
      return redirect(`/tasks/${task.id}`);
    } else {
      throw new ServerError("Some error occured");
    }
  });
  let formRef: HTMLFormElement;
  return (
    <Form class="w-full flex flex-col gap-6 p-4" ref={formRef!}>
      <div>
        <h1 class="text-4xl font-bold">New Task</h1>
      </div>
      <div class="flex flex-col border rounded-sm p-4 gap-4">
        <label class="flex flex-col ">
          <span class="text-sm font-medium">Title</span>
          <input
            name="title"
            disabled={formState.pending}
            type="text"
            placeholder="Title"
            class="bg-white border-b py-2 outline-none"
            autofocus
          />
          <span class="text-xs text-neutral-500">Title of the task</span>
        </label>
        <label class="flex flex-col">
          <span class="text-sm font-medium">Description</span>
          <input
            disabled={formState.pending}
            name="description"
            type="text"
            placeholder="Description"
            class="bg-white border-b py-2 outline-none"
          />
        </label>
        <label class="flex flex-col">
          <span class="text-sm font-medium">Due Date</span>
          <input
            disabled={formState.pending}
            name="dueDate"
            type="date"
            placeholder="Due Date"
            class="w-min bg-white py-2 outline-none"
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
          options={task_status.enumValues}
          disabled={formState.pending}
          placeholder="Select a status"
          defaultValue={task_status.enumValues[0]}
        >
          Status
        </Select>
        <TipTap content={{}} name="content" />
        <Show when={error()}>
          {(e) => (
            <>
              <For each={Object.keys(e().flatten().fieldErrors) as (keyof z.infer<typeof TaskFormSchema>)[]}>
                {(key) => <span class="text-xs text-red-500">{e().formErrors.fieldErrors[key]}</span>}
              </For>
            </>
          )}
        </Show>
      </div>
      <div class="flex w-full justify-between gap-2">
        <div class="flex w-full"></div>
        <div class="flex flex-row gap-2">
          <A href="/tasks">
            <button type="button" class="border w-max bg-neutral-100 text-black py-1 px-4 rounded-sm">
              Back
            </button>
          </A>
          <button
            disabled={formState.pending}
            type="button"
            class="w-max bg-black text-white py-1 px-4 rounded-sm"
            onClick={() => {
              // first validate the form
              const data = Object.fromEntries(new FormData(formRef).entries());
              const validated = TaskFormSchema.safeParse(data);
              if (!validated.success) {
                setError(validated.error);
              } else {
                formRef?.submit();
              }
            }}
          >
            Create
          </button>
        </div>
      </div>
    </Form>
  );
});

export default Page;
