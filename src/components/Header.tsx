import { Show, createSignal, onMount } from "solid-js";
import { A } from "solid-start";
import { login, logout, useSession } from "../utils/auth";
import { addKeybind } from "../utils/keybinds";
import { Button } from "./Button";
import { Moon } from "./icons/moon";
import { Sun } from "./icons/sun";

export const Header = () => {
  const { loading, state, latest } = useSession();
  const [theme, setTheme] = createSignal<"light" | "dark" | undefined>();

  onMount(() => {
    const t = localStorage.getItem("theme");
    if (t === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
    addKeybind(
      "j",
      () => {
        toggleTheme();
      },
      ["ctrlKey"],
      true
    );
  });

  const toggleTheme = () => {
    if (theme() === "dark") {
      setTheme("light");
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    } else {
      setTheme("dark");
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <div class="fixed bg-white dark:bg-black z-50 top-0 left-0 right-0 flex gap-4 items-center h-14 border-b dark:border-b-neutral-900 justify-between">
      <div class="flex gap-4 pl-4 dark:text-white">
        <A href="/">Home</A>
        <Show when={!loading && state === "ready" && latest !== null}>
          <A href="/tasks">Tasks</A>
        </Show>
      </div>
      <div class="flex gap-4 p-2">
        <Button.Secondary onClick={toggleTheme}>
          <div>{theme() === "dark" ? <Sun size={16} /> : <Moon size={16} />}</div>
        </Button.Secondary>
        <Show
          when={!loading && state === "ready" && latest}
          fallback={<Button.Primary onClick={login}>Login</Button.Primary>}
        >
          {(state) => (
            <div class="flex justify-between items-center gap-2 text-black dark:text-white">
              <img class="h-8 w-8 rounded-full" src={state().user?.image ?? ""} alt={state().user?.name ?? "User"} />
              {state().user?.name}
              <Button.Primary onClick={logout}>Logout</Button.Primary>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
};
