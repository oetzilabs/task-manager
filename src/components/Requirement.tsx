import { getSession } from "@auth/solid-start";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { eq } from "drizzle-orm";
import { Show } from "solid-js";
import { A, useLocation } from "solid-start";
import { createServerAction$, redirect } from "solid-start/server";
import { PenLine } from "~/components/icons/penline";
import { Trash } from "~/components/icons/trash";
import { RequirementPriorityColors } from "~/utils/colors";
import { db } from "../db";
import { RequirementSelect, TaskSelect, requirements } from "../db/schema";
import { authOpts } from "../routes/api/auth/[...solidauth]";
import { classNames } from "../utils/css";
import { Button } from "./Button";
import { Calendar } from "./icons/calendar";
dayjs.extend(advancedFormat);

interface RequirementProps {
  requirement: RequirementSelect & {
    task: TaskSelect;
  };
  wid: string;
}

export const Requirement = (props: RequirementProps) => {
  const [deletionState, deleteRequirement] = createServerAction$(
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
      const req = await db.query.requirements.findFirst({
        where(fields, operators) {
          return operators.eq(fields.id, id);
        },
        with: { task: true },
      });
      if (!req) {
        throw new Error("Task not found");
      }
      const [t] = await db
        .update(requirements)
        .set({
          updatedAt: new Date(),
          removedAt: new Date(),
        })
        .where(eq(requirements.id, req.id))
        .returning();
      if (!t) {
        throw new Error("Some error occured");
      }
      if (url.includes(req.id)) {
        return redirect(`/workspaces/${req.task.workspace_id}/tasks/${t.taskId}`);
      } else {
        return t;
      }
    },
    {
      invalidate: () => ["workspaces", "workspace", props.wid, "tasks", "task", props.requirement.taskId],
    }
  );

  const urlPath = useLocation().pathname;
  const hasId = urlPath.includes(props.requirement.id);

  const ReqTitle = () => {
    const x = (
      <h2
        class={classNames(
          "text-xl font-bold",
          !hasId && "hover:underline underline-offset-2 cursor-pointer",
          hasId && "cursor-default select-none"
        )}
      >
        {props.requirement.title}
      </h2>
    );

    if (hasId) {
      return x;
    }

    return (
      <A
        href={`/workspaces/${props.requirement.task.workspace_id}/tasks/${props.requirement.taskId}/rq/${props.requirement.id}`}
      >
        {x}
      </A>
    );
  };
  return (
    <div class="w-full p-4 border border-neutral-200 bg-neutral-50 rounded-sm dark:border-neutral-900 dark:bg-neutral-950">
      <div class="w-full flex flex-col">
        <div class="w-full flex flex-col gap-2">
          <div class="w-full flex flex-row gap-2 justify-between">
            <div class="flex flex-1 flex-row gap-2 items-center">
              <div class="relative w-max flex flex-col gap-2">
                <div class="flex flex-row gap-2 items-center">
                  <div class="flex flex-row gap-1 items-center select-none">
                    <div class="text-xs text-neutral-400">
                      <Calendar size={14} />
                    </div>
                    <div class="text-xs text-neutral-400">Due</div>
                    <div class="text-xs text-neutral-400">
                      {dayjs(props.requirement.dueDate).format("Do MMMM YYYY")}
                    </div>
                  </div>
                </div>
                <div class="w-max flex flex-row gap-2 items-center select-none">
                  <div
                    class="w-3 h-3 rounded-full"
                    style={{
                      ["background-color"]: RequirementPriorityColors[props.requirement.priority],
                    }}
                  />
                  <div
                    class="text-sm"
                    style={{
                      color: RequirementPriorityColors[props.requirement.priority],
                    }}
                  >
                    {props.requirement.priority}
                  </div>
                  <div class="text-xs text-neutral-400">{props.requirement.status}</div>
                </div>
              </div>
            </div>
            <div class="flex flex-row gap-1 h-min">
              <A
                href={`/workspaces/${props.requirement.task.workspace_id}/tasks/${props.requirement.task.id}/rq/${props.requirement.id}/edit`}
              >
                <Button.Tertiary class="border-none !p-2">
                  <PenLine size={16} />
                  <span class="sr-only">Edit</span>
                </Button.Tertiary>
              </A>
              <Show when={props.requirement.removedAt === null}>
                <Button.Tertiary
                  title={`Delete ${props.requirement.id}`}
                  disabled={deletionState.pending}
                  onClick={() => {
                    deleteRequirement([urlPath, props.requirement.id]);
                  }}
                  class="border-none !p-2 !text-red-500 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900 dark:hover:!text-white"
                >
                  <Trash size={16} />
                  <span class="sr-only">Delete</span>
                </Button.Tertiary>
              </Show>
            </div>
          </div>
          <div class="flex flex-row gap-1 dark:text-white">
            <ReqTitle />
          </div>
          <div class="text-sm dark:text-white">{props.requirement.description}</div>
        </div>
      </div>
    </div>
  );
};
