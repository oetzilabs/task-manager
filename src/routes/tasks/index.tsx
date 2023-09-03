import { getSession } from "@auth/solid-start";
import { A } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { For, JSX, Show, createSignal } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { LayoutGrid } from "~/components/icons/layout-grid";
import { Plus } from "~/components/icons/plus";
import { Rows } from "~/components/icons/rows";
import { db } from "~/db";
import { Button } from "../../components/Button";
import { Task } from "../../components/Task";
import { authOpts } from "../api/auth/[...solidauth]";
dayjs.extend(advancedFormat);

export function routeData() {
  const tasks = createServerData$(
    async (_, { request }) => {
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
      return user_has_tasks.map((uht) => uht.task).filter((t) => t.removedAt === null);
    },
    {
      key: () => ["tasks"],
    }
  );

  return tasks;
}

const classNames = (...classes: (string | boolean)[]) => classes.filter(Boolean).join(" ");

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
      <div class="w-full flex flex-row justify-between border-b dark:border-b-neutral-900 pb-2 text-black dark:text-white">
        <div class="flex flex-1 gap-2">
          <h1 class="text-2xl font-bold">Tasks</h1>
        </div>
        <div class="flex flex-row gap-2 w-content">
          <Show when={!tasks.loading && (tasks() ?? []).length > 0}>
            <Button.Secondary class="border dark:border-neutral-900 w-max outline-none cursor-pointer hover:bg-neutral-100 py-1 px-2 rounded-sm">
              <div
                class="flex flex-row gap-2 justify-between items-center"
                onClick={() => {
                  setLayout(layout() === "grid" ? "list" : "grid");
                }}
              >
                {layout() === "grid" ? layoutIcon.grid : layoutIcon.list}
                {layout()}
              </div>
            </Button.Secondary>
          </Show>
          <A href="/tasks/new">
            <Button.Primary>
              <Plus size={16} />
              <span>New Task</span>
            </Button.Primary>
          </A>
        </div>
      </div>
      <Show when={tasks.loading}>
        <div class="">Loading...</div>
      </Show>
      <Show when={tasks.error}>
        <div class="text-red-500">Error: {tasks.error?.message ?? "Some error occured"}</div>
      </Show>
      <Show when={!tasks.error && tasks()}>
        {(ts) => (
          <div class={classNames("w-full gap-2", layoutCss[layout()])}>
            <For
              each={ts()}
              fallback={
                <div class="border dark:border-neutral-900 w-full p-14 flex flex-col items-center justify-center gap-4 bg-neutral-100 dark:bg-neutral-950 rounded-sm">
                  <span class="text-neutral-500">No tasks have been found</span>
                  <A href="/tasks/new">
                    <Button.Primary>Create a new task</Button.Primary>
                  </A>
                </div>
              }
            >
              {(task) => <Task task={task} />}
            </For>
          </div>
        )}
      </Show>
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
