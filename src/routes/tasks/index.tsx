import { getSession } from "@auth/solid-start";
import { A } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { LayoutGrid, Plus, Rows } from "lucide-solid";
import { For, JSX, Show, createSignal } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { db } from "~/db";
import { Task } from "../../components/Task";
import { authOpts } from "../api/auth/[...solidauth]";
dayjs.extend(advancedFormat);

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
        return operators.eq(fields.email, email);
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

const classNames = (...classes: string[]) => classes.filter(Boolean).join(" ");

type Layout = "grid" | "list";

const layoutCss: Record<Layout, string> = {
  grid: "grid grid-cols-2",
  list: "flex flex-col",
};

const layoutIcon: Record<Layout, JSX.Element> = {
  grid: <LayoutGrid size={16} />,
  list: <Rows size={16} />,
};

export const TaskList = () => {
  const tasks = useRouteData<typeof routeData>();
  const [layout, setLayout] = createSignal<Layout>("grid");
  return (
    <div class="w-full flex flex-col gap-2 py-4">
      <div class="w-full flex flex-row justify-between border-b pb-2">
        <div class="flex flex-1 gap-2">
          <h1 class="text-2xl font-bold">Tasks</h1>
        </div>
        <div class="flex flex-row gap-2 w-content">
          <div class="border w-max outline-none cursor-pointer hover:bg-neutral-100 py-1 px-2 rounded-sm">
            <div
              class="flex gap-2 items-center"
              onClick={() => {
                setLayout(layout() === "grid" ? "list" : "grid");
              }}
            >
              {layout() === "grid" ? layoutIcon.grid : layoutIcon.list}
              {layout()}
            </div>
          </div>
          <A href="/tasks/new">
            <button class="flex gap-1 items-center bg-black text-white py-1 px-2 rounded-sm hover:bg-neutral-900">
              <Plus size={16} />
              <span class="text-white">New Task</span>
            </button>
          </A>
        </div>
      </div>
      <div class={classNames("w-full gap-2", layoutCss[layout()])}>
        <Show when={tasks.loading}>
          <div class="">Loading...</div>
        </Show>
        <Show when={tasks.error}>
          <div class="text-red-500">Error: {tasks.error?.message ?? "Some error occured"}</div>
        </Show>
        <Show when={!tasks.error && tasks()}>
          {(ts) => (
            <>
              <Show when={ts().length === 0}>
                <div class="">No tasks found</div>
              </Show>
              <Show when={ts().length > 0}>
                <For each={ts()}>{(task) => <Task task={task} />}</For>
              </Show>
            </>
          )}
        </Show>
      </div>
    </div>
  );
};

export const Page = () => {
  return (
    <div class="w-full flex flex-col gap-2 p-4">
      <TaskList />
    </div>
  );
};

export default Page;
