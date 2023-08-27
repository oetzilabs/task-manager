import { getSession } from "@auth/solid-start";
import { A } from "@solidjs/router";
import { For, Show, createSignal } from "solid-js";
import { ServerError, createServerAction$, redirect } from "solid-start/server";
import { z } from "zod";
import Protected from "~/components/Protected";
import { Select } from "~/components/Select";
import { db } from "~/db";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { task_priority, task_status, tasks, users_to_tasks } from "../../db/schema";
import { TaskPriority, TaskStatus } from "../../db/schema/task";
import { TaskFormSchema } from "../../utils/form/schemas";
import { authOpts } from "../api/auth/[...solidauth]";

export const { routeData, Page } = Protected((_) => {
  const [error, setError] = createSignal<any>(null);
  const getError = (name: keyof typeof TaskFormSchema.shape) => {
    if (error() && error().formErrors.fieldErrors[name]) {
      return error().formErrors.fieldErrors[name];
    }
    return null;
  };
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
    <Form class="w-full flex flex-col gap-4 p-4 text-black dark:text-white" ref={formRef!}>
      <div>
        <h1 class="text-4xl font-bold">New Task</h1>
      </div>
      <div class="flex flex-col border dark:border-neutral-900 rounded-sm p-4 gap-4">
        <label class="flex flex-col gap-0.5">
          <span class="text-sm font-medium">Title</span>
          <Input name="title" disabled={formState.pending} type="text" placeholder="Title" autofocus />
          <Show when={getError("title") && getError("title")}>
            {(e) => <span class="text-xs text-red-500">{e()}</span>}
          </Show>
        </label>
        <label class="flex flex-col gap-0.5">
          <span class="text-sm font-medium">Description</span>
          <Input disabled={formState.pending} name="description" type="text" placeholder="Description" />
          <Show when={getError("description") && getError("description")}>
            {(e) => <span class="text-xs text-red-500">{e()}</span>}
          </Show>
        </label>
        <label class="flex flex-col gap-0.5">
          <span class="text-sm font-medium">Due Date</span>
          <Input disabled={formState.pending} name="dueDate" type="date" placeholder="Due Date" />
          <Show when={getError("dueDate") && getError("dueDate")}>
            {(e) => <span class="text-xs text-red-500">{e()}</span>}
          </Show>
        </label>
        <div class="flex flex-col gap-0.5">
          <Select<TaskPriority>
            name="priority"
            disabled={formState.pending}
            options={task_priority.enumValues}
            placeholder="Select a priority…"
            defaultValue={task_priority.enumValues[0]}
          >
            Priority
          </Select>
          <Show when={getError("priority") && getError("priority")}>
            {(e) => <span class="text-xs text-red-500">{e()}</span>}
          </Show>
        </div>
        <div class="flex flex-col gap-0.5">
          <Select<TaskStatus>
            name="status"
            options={task_status.enumValues}
            disabled={formState.pending}
            placeholder="Select a status"
            defaultValue={task_status.enumValues[0]}
          >
            Status
          </Select>
          <Show when={getError("status") && getError("status")}>
            {(e) => <span class="text-xs text-red-500">{e()}</span>}
          </Show>
        </div>
      </div>
      <div class="flex w-full justify-between gap-2">
        <div class="flex w-full"></div>
        <div class="flex flex-row gap-2">
          <A href="/tasks">
            <Button.Secondary type="button">Back</Button.Secondary>
          </A>
          <Button.Primary
            disabled={formState.pending}
            type="button"
            onClick={() => {
              const data = Object.fromEntries(new FormData(formRef).entries());
              const validated = TaskFormSchema.safeParse(data);
              if (!validated.success) {
                setError(validated.error);
              } else {
                formRef.submit();
              }
            }}
          >
            Create
          </Button.Primary>
        </div>
      </div>
    </Form>
  );
});

export default Page;
