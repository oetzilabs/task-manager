import { RouteDataFuncArgs, useRouteData } from "solid-start";
import { db } from "~/db";
import { createServerAction$, createServerData$, redirect } from "solid-start/server";
import { getSession } from "@auth/solid-start";
import { authOpts } from "../../api/auth/[...solidauth]";
import { TaskFormSchema } from "../../../utils/form/schemas";
import { task_priority, task_status, tasks, users_to_tasks } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { Show, onMount } from "solid-js";
import dayjs from "dayjs";

// taks id page, solid js need routeData
export const routeData = ({ params }: RouteDataFuncArgs) => {
  const task = createServerData$(
    async (id: string) => {
      const task = await db.query.tasks.findFirst({
        where(fields, operators) {
          return operators.eq(fields.id, id);
        },
      });
      return task;
    },
    { key: () => params.id }
  );
  return task;
};

export const Page = () => {
  const task = useRouteData<typeof routeData>();
  const [{ pending, error }, { Form }] = createServerAction$(async (formData: FormData, { request }) => {
    const session = await getSession(request, authOpts);
    if (!session) {
      throw new Error("Session not found");
    }
    const data = Object.fromEntries(formData.entries());
    const validated = TaskFormSchema.safeParse(data);

    if (!validated.success) {
      console.log(validated.error.formErrors);
      throw new Error("Missing data");
    } else {
      const user = await db.query.users.findFirst({
        where(fields, operators) {
          return operators.eq(fields.email, session.user!.email!);
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      const [task] = await db.insert(tasks).values(validated.data).returning();
      await db.insert(users_to_tasks).values({ user_id: user.id, task_id: task.id }).returning();
      if (task) {
        return redirect(`/tasks/${task.id}`);
      } else {
        throw new Error("Some error occured");
      }
    }
    return redirect("/");
  });
  return (
    <Show when={!task.loading && task()}>
      {(t) => (
        <Form class="w-full flex flex-col gap-6 p-4">
          <input type="hidden" name="id" value={t().id} />
          <div>
            <h1 class="text-4xl font-bold">Edit Task</h1>
          </div>
          <div class="flex flex-col border p-2 gap-2">
            <label class="flex flex-col ">
              <span class="text-sm font-medium">Title</span>
              <input
                name="title"
                type="text"
                placeholder="Title"
                class="bg-white border-b py-2 outline-none"
                autofocus
                value={t().title}
              />
            </label>
            <label class="flex flex-col">
              <span class="text-sm font-medium">Description</span>
              <input
                name="description"
                type="text"
                placeholder="Description"
                class="bg-white border-b py-2 outline-none"
                value={t().description}
              />
            </label>
            <label class="flex flex-col">
              <span class="text-sm font-medium">Priority</span>
              <input
                name="dueDate"
                type="date"
                placeholder="Due Date"
                class="bg-white py-2 outline-none"
                value={dayjs(t().dueDate).format("YYYY-MM-DD")}
              />
            </label>
            <label class="flex flex-col">
              <span class="text-sm font-medium">Priority</span>
              <select name="priority" class="bg-white py-2 outline-none" value={t().priority}>
                {task_priority.enumValues.map((value) => (
                  <option value={value}>{value}</option>
                ))}
              </select>
            </label>
            <label class="flex flex-col">
              <span class="text-sm font-medium">Status</span>
              <select name="status" class="bg-white py-2 outline-none" value={t().status}>
                {task_status.enumValues.map((value) => (
                  <option value={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
          <div class="flex w-full justify-between gap-2">
            <div class="flex w-full"></div>
            <div>
              <button disabled={pending} type="submit" class="w-max bg-black text-white py-1 px-4 rounded-sm">
                Create
              </button>
            </div>
          </div>
        </Form>
      )}
    </Show>
  );
};

export default Page;
