import { getSession } from "@auth/solid-start";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { eq } from "drizzle-orm";
import { Show } from "solid-js";
import { A, useLocation } from "solid-start";
import { createServerAction$, redirect } from "solid-start/server";
import { CopyPlus } from "~/components/icons/copy-plus";
import { PenLine } from "~/components/icons/penline";
import { Trash } from "~/components/icons/trash";
import { TaskPriorityColors } from "~/utils/colors";
import { db } from "../db";
import { TaskSelect, WorkspaceSelect, tasks, users_to_tasks, workspaces } from "../db/schema";
import { authOpts } from "../routes/api/auth/[...solidauth]";
import { Button } from "./Button";
import { Calendar } from "./icons/calendar";
import { classNames } from "../utils/css";
dayjs.extend(advancedFormat);

interface WorkspaceProps {
  ws: WorkspaceSelect;
}

export const Workspace = (props: WorkspaceProps) => {
  const [duplicationState, duplicateWorkspace] = createServerAction$(
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
      const ws = await db.query.workspaces.findFirst({
        where(fields, operators) {
          return operators.eq(fields.id, id);
        },
      });
      if (!ws) {
        throw new Error("Workspace not found");
      }

      const [newWorkspace] = await db
        .insert(workspaces)
        .values({
          name: ws.name,
        })
        .returning();
      if (!newWorkspace) {
        throw new Error("Some error occured");
      }
      await db.insert(users_to_tasks).values({ user_id: user.id, task_id: newWorkspace.id }).returning();
      return newWorkspace;
    },
    {
      invalidate: () => ["workspaces", "workspace", props.ws.id],
    }
  );

  const urlPath = useLocation().pathname;
  const hasId = urlPath.includes(props.ws.id);

  const WorkspaceTitle = () => {
    const x = (
      <h2
        class={classNames(
          "text-xl font-bold",
          !hasId && "hover:underline underline-offset-2 cursor-pointer",
          hasId && "cursor-default select-none"
        )}
      >
        {props.ws.name}
      </h2>
    );

    if (hasId) {
      return x;
    }

    return <A href={props.ws.id}>{x}</A>;
  };

  const [deletionState, deleteWorkspace] = createServerAction$(
    async ([url, id]: string[], { request }) => {
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
      const ws = await db.query.workspaces.findFirst({
        where(fields, operators) {
          return operators.eq(fields.id, id);
        },
      });
      if (!ws) {
        throw new Error("Workspace not found");
      }
      const [w] = await db
        .update(workspaces)
        .set({
          updatedAt: new Date(),
          removedAt: new Date(),
        })
        .where(eq(workspaces.id, ws.id))
        .returning();
      if (!w) {
        throw new Error("Some error occured");
      }
      if (url.includes(w.id)) return redirect(`/workspaces`);
      return w;
    },
    {
      invalidate: () => ["workspaces", "workspace", props.ws.id],
    }
  );
  return (
    <div class="w-full p-4 border border-neutral-200 bg-neutral-50 rounded-sm dark:border-neutral-900 dark:bg-neutral-950">
      <div class="w-full flex flex-col">
        <div class="w-full flex flex-col gap-2">
          <div class="w-full flex flex-row gap-2 justify-between">
            <div class="flex flex-1 flex-row gap-2 items-center">
              <div class="flex flex-row gap-1 dark:text-white">
                <WorkspaceTitle />
              </div>
            </div>
            <div class="flex flex-row gap-1 h-min">
              <Button.Tertiary
                disabled={duplicationState.pending}
                onClick={() => {
                  duplicateWorkspace(props.ws.id);
                }}
                class="border-none !p-2"
              >
                <CopyPlus size={16} />
                <span class="sr-only">Duplicate</span>
              </Button.Tertiary>
              <A href={`${hasId ? "" : `/workspaces/${props.ws.id}/`}edit`}>
                <Button.Tertiary class="border-none !p-2">
                  <PenLine size={16} />
                  <span class="sr-only">Edit</span>
                </Button.Tertiary>
              </A>
              <Show when={props.ws.removedAt === null}>
                <Button.Tertiary
                  disabled={deletionState.pending}
                  onClick={() => {
                    deleteWorkspace([urlPath, props.ws.id]);
                  }}
                  class="border-none !p-2 !text-red-500 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900 dark:hover:!text-white"
                >
                  <Trash size={16} />
                  <span class="sr-only">Delete</span>
                </Button.Tertiary>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
