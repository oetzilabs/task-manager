import { JSX } from "solid-js";
import { classNames } from "../utils/css";

export const Input = (props: JSX.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      {...props}
      class={classNames(
        "px-3 py-1.5 flex gap-1 items-center rounded-sm border dark:bg-neutral-950 dark:border-neutral-900",
        props.class
      )}
    />
  );
};
