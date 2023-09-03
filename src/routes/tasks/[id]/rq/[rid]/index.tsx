import { getSession } from "@auth/solid-start";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Show } from "solid-js";
import { RouteDataFuncArgs, useRouteData } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import { Requirement } from "~/components/Requirement";
import { db } from "~/db";
import { requirements } from "../../../../../db/schema";
import { authOpts } from "../../../../api/auth/[...solidauth]";
dayjs.extend(advancedFormat);

// taks id page, solid js need routeData
export const routeData = ({ params }: RouteDataFuncArgs) => {
  const task = createServerData$(
    async (id: string) => {
      const task = await db.query.requirements.findFirst({
        with: {
          task: true,
        },
        where(fields, operators) {
          return operators.eq(fields.id, id);
        },
      });
      return task;
    },
    { key: () => params.rid }
  );
  return task;
};

export const Page = () => {
  const rq = useRouteData<typeof routeData>();

  const [deleteRequirementState, deleteRequirement] = createServerAction$(
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
      const task = await db.query.requirements.findFirst({
        where(fields, operators) {
          return operators.eq(fields.id, id);
        },
      });
      if (!task) {
        throw new Error("Requirement not found");
      }
      const [rq_] = await db
        .update(requirements)
        .set({
          updatedAt: new Date(),
          removedAt: new Date(),
        })
        .returning();
      if (!rq_) {
        throw new Error("Some error occured");
      }
    },
    {
      invalidate: () => ["requirements", "tasks", rq()?.id ?? ""],
    }
  );

  return (
    <div class="w-full flex flex-col gap-2 p-4">
      <Show when={rq()}>
        {(r) => (
          <div class="flex flex-col gap-4">
            <Requirement requirement={r()} />
          </div>
        )}
      </Show>
    </div>
  );
};

export default Page;
