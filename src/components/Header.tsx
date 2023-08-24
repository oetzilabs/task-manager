import { Show } from "solid-js";
import { A } from "solid-start";
import { login, logout, useSession } from "../utils/auth";

export const Header = () => {
  const { loading, state, latest, error } = useSession();

  return (
    <div class="fixed bg-white z-50 top-0 left-0 right-0 flex gap-4 items-center h-14 border-b justify-between">
      <div class="flex gap-4 pl-4">
        <A href="/">Home</A>
        <Show when={!loading && state === "ready" && latest}>
          {(state) => (
            <>
              <A href="/tasks">Tasks</A>
            </>
          )}
        </Show>
      </div>
      <div class="flex gap-4 p-2">
        <Show when={!loading && state === "errored" && error}>
          {(e) => (
            <button class="flex justify-between items-center bg-red-100 p-2" onClick={login}>
              {e().message}
            </button>
          )}
        </Show>
        <Show
          when={!loading && state === "ready" && latest}
          fallback={
            <button class="flex justify-between items-center bg-black text-white py-1 px-4 rounded-sm" onClick={login}>
              Login
            </button>
          }
        >
          {(state) => (
            <div class="flex justify-between items-center gap-2">
              <img class="h-8 w-8 rounded-full" src={state().user?.image ?? ""} alt={state().user?.name ?? "User"} />
              {state().user?.name}
              <button
                class="flex justify-between items-center bg-black text-white py-1 px-4 rounded-sm"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
};
