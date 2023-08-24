import { For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { createServerData$, redirect } from "solid-start/server";
import { db } from "../db";
import { getSession } from "@auth/solid-start";
import { authOpts } from "../routes/api/auth/[...solidauth]";
import { useRouteData } from "solid-start";

export function routeData() {
  const tasks = createServerData$(async (_, { request }) => {
    const session = await getSession(request, authOpts);
    if (!session) {
      return [];
    }
    if (!session.user) {
      return [];
    }
    if (!session.user.email) {
      return [];
    }
    const email = session.user.email;

    const user = await db.query.users.findFirst({
      where(fields, operators) {
        return operators.eq(fields.email, session.user!.email!);
      },
    });
    if (!user) {
      return [];
    }
    const user_has_tasks = await db.query.users_to_tasks.findMany({
      with: {
        user: true,
        task: true,
      },
      where(fields, operators) {
        return operators.eq(fields.user_id, user.id);
      },
    });
    return user_has_tasks.map((uht) => uht.task);
  });

  return tasks;
}

export const TaskList = () => {
  const tasks = useRouteData<typeof routeData>();
  return (
    <div class="w-full flex flex-col gap-2">
      <Show when={tasks.loading}>
        <div class="">Loading...</div>
      </Show>
      <Show when={tasks.error}>
        <div class="">Error: {tasks.error?.message ?? "Some error occured"}</div>
      </Show>
      <Show when={!tasks.error && tasks()}>
        {(ts) => (
          <>
            <Show when={ts().length === 0}>
              <div class="">No tasks found</div>
              <A href="/tasks/new">
                <button>Add a new task</button>
              </A>
            </Show>
            <Show when={ts().length > 0}>
              <div class="flex flex-col gap-2">
                <For each={ts()}>{(task) => <div class="w-full p-4">{task.title}</div>}</For>
              </div>
            </Show>
          </>
        )}
      </Show>
    </div>
  );
};
