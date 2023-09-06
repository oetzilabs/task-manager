import { getSession } from "@auth/solid-start";
import { A } from "@solidjs/router";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { For, JSX, Show, createSignal } from "solid-js";
import { RouteDataArgs, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { Button } from "~/components/Button";
import { LayoutGrid } from "~/components/icons/layout-grid";
import { Plus } from "~/components/icons/plus";
import { Rows } from "~/components/icons/rows";
import { db } from "~/db";
import { authOpts } from "../api/auth/[...solidauth]";
import { Workspace } from "../../components/Workspace";
dayjs.extend(advancedFormat);

export function routeData({ params }: RouteDataArgs) {
  const ws = createServerData$(
    async ([_, wid], { request }) => {
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
      const user_has_workspaces = await db.query.users_to_workspaces.findMany({
        with: {
          user: true,
          workspace: {
            with: {
              tasks: true,
            },
          },
        },
        where(fields, op) {
          return op.eq(fields.user_id, user.id);
        },
      });
      return user_has_workspaces.map((uhw) => uhw.workspace).filter((t) => t.removedAt === null);
    },
    {
      key: () => ["workspaces", params.wid],
    }
  );

  return ws;
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

export const WorkspaceList = () => {
  const ws = useRouteData<typeof routeData>();
  const [layout, setLayout] = createSignal<Layout>("grid");
  return (
    <div class="w-full flex flex-col gap-2 py-4">
      <div class="w-full flex flex-row justify-between border-b dark:border-b-neutral-900 pb-2 text-black dark:text-white">
        <div class="flex flex-1 gap-2">
          <h1 class="text-2xl font-bold">Workspaces</h1>
        </div>
        <div class="flex flex-row gap-2 w-content">
          <Show when={!ws.loading && (ws() ?? []).length > 0}>
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
          <A href="new">
            <Button.Primary>
              <Plus size={16} />
              <span>New Workspace</span>
            </Button.Primary>
          </A>
        </div>
      </div>
      <Show when={ws.loading}>
        <div class="">Loading...</div>
      </Show>
      <Show when={ws.error}>
        <div class="text-red-500">Error: {ws.error?.message ?? "Some error occured"}</div>
      </Show>
      <Show when={!ws.error && ws()}>
        {(w) => (
          <div class={classNames("w-full gap-2", w().length > 0 ? layoutCss[layout()] : "flex flex-col")}>
            <For
              each={w()}
              fallback={
                <div class="border dark:border-neutral-900 w-full p-14 flex flex-col items-center justify-center gap-4 bg-neutral-100 dark:bg-neutral-950 rounded-sm">
                  <span class="text-neutral-500">No workspaces have been found</span>
                  <A href="new">
                    <Button.Primary>Create a new workspace</Button.Primary>
                  </A>
                </div>
              }
            >
              {(w) => <Workspace ws={w} />}
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
      <WorkspaceList />
    </div>
  );
};

export default Page;
