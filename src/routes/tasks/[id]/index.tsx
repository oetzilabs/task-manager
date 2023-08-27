import { RouteDataFuncArgs, useRouteData } from "solid-start";
import { db } from "~/db";
import { createServerData$ } from "solid-start/server";
import { Show } from "solid-js";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Task } from "../../../components/Task";
dayjs.extend(advancedFormat);

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

  return (
    <div class="w-full flex flex-col gap-2 p-4">
      <Show when={!task.loading && task()}>{(t) => <Task task={t()} />}</Show>
    </div>
  );
};

export default Page;
