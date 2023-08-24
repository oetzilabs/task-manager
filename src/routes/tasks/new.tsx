import { createRouteAction } from "solid-start";
import { createServerAction$, redirect } from "solid-start/server";
import Protected from "~/components/Protected";
import { task_priority, task_status, tasks, users_to_tasks } from "../../db/schema";
import { TaskFormSchema } from "../../utils/form/schemas";
import { db } from "../../db";
import { authOpts } from "../api/auth/[...solidauth]";
import { getSession } from "@auth/solid-start";

export const { routeData, Page } = Protected((_) => {
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
        return redirect("/tasks");
      } else {
        throw new Error("Some error occured");
      }
    }
    return redirect("/");
  });
  return (
    <Form class="w-full flex flex-col gap-6 p-4">
      <div>
        <h1 class="text-4xl font-bold">New Task</h1>
      </div>
      <div class="flex flex-col border p-2 gap-2">
        <label class="flex flex-col ">
          <span class="text-sm font-medium">Title</span>
          <input name="title" type="text" placeholder="Title" class="bg-white border-b py-2 outline-none" autofocus />
        </label>
        <label class="flex flex-col">
          <span class="text-sm font-medium">Description</span>
          <input name="description" type="text" placeholder="Description" class="bg-white border-b py-2 outline-none" />
        </label>
        <label class="flex flex-col">
          <span class="text-sm font-medium">Priority</span>
          <input name="dueDate" type="date" placeholder="Due Date" class="bg-white py-2 outline-none" />
        </label>
        <label class="flex flex-col">
          <span class="text-sm font-medium">Priority</span>
          <select name="priority" class="bg-white py-2 outline-none">
            {task_priority.enumValues.map((value) => (
              <option value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label class="flex flex-col">
          <span class="text-sm font-medium">Status</span>
          <select name="status" class="bg-white py-2 outline-none" value={task_status.enumValues[0]}>
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
  );
});

export default Page;
