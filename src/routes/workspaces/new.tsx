import { getSession } from "@auth/solid-start";
import { A, useParams } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { RouteDataArgs, useRouteData } from "solid-start";
import { ServerError, createServerAction$, createServerData$, redirect } from "solid-start/server";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { db } from "~/db";
import { users_to_workspaces, workspaces } from "~/db/schema";
import { TaskFormSchema, WorkspaceFormSchema } from "~/utils/form/schemas";
import { authOpts } from "../api/auth/[...solidauth]";

export const routeData = ({ params }: RouteDataArgs) => {
  const routeDataResult = createServerData$(
    async (p: string[], { request }) => {
      const session = await getSession(request, authOpts);
      if (!session) {
        redirect("/api/auth/signin");
        return;
      }
      const [x, y, id] = p;
      const workspace = await db.query.workspaces.findFirst({
        where(fields, operators) {
          return operators.eq(fields.id, id);
        },
      });
      return workspace;
    },
    { key: () => ["workspaces", "workspace", params.wid] }
  );
  return routeDataResult;
};

const Page = () => {
  const [error, setError] = createSignal<any>(null);

  const getError = (name: keyof typeof WorkspaceFormSchema.shape) => {
    if (error() && error().formErrors.fieldErrors[name]) {
      return error().formErrors.fieldErrors[name];
    }
    return null;
  };

  const [formState, { Form }] = createServerAction$(async (formData: FormData, { request }) => {
    const session = await getSession(request, authOpts);
    if (!session) {
      throw new Error("Session not found");
    }
    const data = WorkspaceFormSchema.parse(Object.fromEntries(formData.entries()));

    const user = await db.query.users.findFirst({
      where(fields, operators) {
        return operators.eq(fields.email, session.user!.email!);
      },
    });
    if (!user) {
      throw new ServerError("User not found");
    }
    const [ws] = await db
      .insert(workspaces)
      .values({
        name: data.name,
      })
      .returning();
    await db.insert(users_to_workspaces).values({ user_id: user.id, workspace_id: ws.id }).returning();

    if (ws) {
      return redirect(`/workspaces/${ws.id}`);
    } else {
      throw new ServerError("Some error occured");
    }
  });

  let formRef: HTMLFormElement;

  let { wid } = useParams();

  const ws = useRouteData<typeof routeData>();

  return (
    <Form class="w-full flex flex-col gap-4 p-4 text-black dark:text-white" ref={formRef!}>
      <input hidden name="workspaceId" value={wid} />
      <Show when={ws()}>
        {(w) => (
          <div>
            <h1 class="text-4xl font-bold">New Task for Workspace {w().name}</h1>
          </div>
        )}
      </Show>
      <div class="flex flex-col border dark:border-neutral-900 rounded-sm p-4 gap-4">
        <label class="flex flex-col gap-0.5">
          <span class="text-sm font-medium">Name</span>
          <Input name="name" disabled={formState.pending} type="text" placeholder="Name of the Workspace" autofocus />
          <Show when={getError("name") && getError("name")}>
            {(e) => <span class="text-xs text-red-500">{e()}</span>}
          </Show>
        </label>
      </div>
      <div class="flex w-full justify-between gap-2">
        <div class="flex w-full"></div>
        <div class="flex flex-row gap-2">
          <A href="tasks">
            <Button.Secondary type="button">Back</Button.Secondary>
          </A>
          <Button.Primary
            disabled={formState.pending}
            type="button"
            onClick={() => {
              const data = Object.fromEntries(new FormData(formRef).entries());
              const validated = WorkspaceFormSchema.safeParse(data);
              if (!validated.success) {
                setError(validated.error);
              } else {
                formRef.submit();
              }
            }}
          >
            Create
          </Button.Primary>
        </div>
      </div>
    </Form>
  );
};

export default Page;
