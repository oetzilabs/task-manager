import { getSession } from "@auth/solid-start";
import { eq } from "drizzle-orm";
import { Show, createSignal } from "solid-js";
import { RouteDataFuncArgs, useRouteData } from "solid-start";
import { createServerAction$, createServerData$, redirect } from "solid-start/server";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { db } from "~/db";
import { workspaces } from "~/db/schema";
import { EditWorkspaceFormSchema } from "~/utils/form/schemas";
import { authOpts } from "../../api/auth/[...solidauth]";

export const routeData = ({ params }: RouteDataFuncArgs) => {
  const ws = createServerData$(
    async (p: string[]) => {
      const [_, __, wid] = p;
      const ws = await db.query.workspaces.findFirst({
        where(fields, operators) {
          return operators.eq(fields.id, wid);
        },
      });
      return ws;
    },
    { key: () => ["workspaces", "workspace", params.wid] }
  );
  return ws;
};

export const Page = () => {
  const [error, setError] = createSignal<any | null>(null);
  const ws = useRouteData<typeof routeData>();
  const [formState, { Form }] = createServerAction$(
    async (formData: FormData, { request }) => {
      const session = await getSession(request, authOpts);
      if (!session) {
        throw new Error("Session not found");
      }
      const data = EditWorkspaceFormSchema.parse(Object.fromEntries(formData.entries()));

      const user = await db.query.users.findFirst({
        where(fields, operators) {
          return operators.eq(fields.email, session.user!.email!);
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      const newData = Object.assign(data, { updatedAt: new Date() });
      const [ws] = await db.update(workspaces).set(newData).where(eq(workspaces.id, data.id)).returning();

      if (ws) {
        return redirect(`/workspaces/${ws.id}`);
      } else {
        throw new Error("Some error occured");
      }
    },
    {
      invalidate: ["workspaces", "workspace", ws()?.id],
    }
  );

  let formRef: HTMLFormElement;
  return (
    <Show when={!ws.loading && ws()}>
      {(w) => (
        <Form class="w-full flex flex-col gap-4 p-4 text-black dark:text-white" ref={formRef!}>
          <input type="hidden" name="id" value={w().id} />
          <div>
            <h1 class="text-4xl font-bold">Edit Workspace</h1>
          </div>
          <div class="flex flex-col border dark:border-neutral-900 p-2 gap-2">
            <label class="flex flex-col gap-0.5">
              <span class="text-sm font-medium">Name</span>
              <Input
                name="name"
                disabled={formState.pending}
                type="text"
                placeholder="Name"
                autofocus
                value={w().name}
              />
              <span class="text-xs text-red-500">{error()?.name?.message}</span>
            </label>
          </div>
          <div class="flex w-full justify-between gap-2">
            <div class="flex w-full"></div>
            <div>
              <Button.Primary
                disabled={formState.pending}
                type="button"
                class="w-max bg-black text-white py-1 px-4 rounded-sm"
                onClick={() => {
                  const data = Object.fromEntries(new FormData(formRef).entries());
                  const validated = EditWorkspaceFormSchema.safeParse(data);
                  if (!validated.success) {
                    setError(validated.error);
                  } else {
                    formRef?.submit();
                  }
                }}
              >
                Save
              </Button.Primary>
            </div>
          </div>
        </Form>
      )}
    </Show>
  );
};

export default Page;
