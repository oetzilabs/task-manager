import { onCleanup, onMount } from "solid-js";
import { createStore, produce } from "solid-js/store";

type SpecialKeys = "ctrlKey" | "shiftKey" | "altKey" | "metaKey";

const [Keybinds, setKeybinds] = createStore<
  Record<string, { function: () => void; specialKeys?: SpecialKeys[]; preventDefault?: boolean }>
>({});

export const addKeybind = (
  key: string,
  func: () => void,
  specialKeys?: SpecialKeys[],
  prevent: boolean = false
): void => {
  setKeybinds(
    produce((state) => {
      state[key] = { function: func, specialKeys, preventDefault: prevent };
    })
  );
};

export const removeKeybind = (key: string): void => {
  setKeybinds(
    produce((state) => {
      delete state[key];
    })
  );
};

export const Provider = (props: { children: any }) => {
  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const sK = Keybinds[key].specialKeys;
      if (Keybinds[key]) {
        if (Keybinds[key].preventDefault) {
          e.preventDefault();
        }
        if (!sK) {
          return Keybinds[key].function();
        }
        if (sK.every((specialKey) => e[specialKey])) {
          Keybinds[key].function();
        }
      }
    };
    window.addEventListener("keydown", handler);
    onCleanup(() => window.removeEventListener("keydown", handler));
  });

  return props.children;
};
