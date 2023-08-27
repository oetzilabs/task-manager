import { JSX } from "solid-js";
import { classNames } from "../utils/css";

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const DefaultButton = (props: ButtonProps) => {
  return (
    <button
      {...props}
      class={classNames(
        "px-3 py-1 flex gap-1 items-center rounded-sm border border-black/[0.07] dark:border-white/[0.07]",
        props.class
      )}
    >
      {props.children}
    </button>
  );
};

const Destructive = (props: ButtonProps) => {
  return <DefaultButton {...props} class={classNames("bg-red-500 hover:bg-red-400 text-white", props.class)} />;
};

const Primary = (props: ButtonProps) => {
  return (
    <DefaultButton
      {...props}
      class={classNames("bg-black hover:bg-neutral-900 text-white dark:bg-white dark:text-black", props.class)}
    />
  );
};

const Secondary = (props: ButtonProps) => {
  return (
    <DefaultButton
      {...props}
      class={classNames(
        "bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-black dark:text-white",
        props.class
      )}
    />
  );
};

const Tertiary = (props: ButtonProps) => {
  return (
    <DefaultButton
      {...props}
      class={classNames(
        "bg-transparent hover:bg-black/[0.05] text-black dark:text-white dark:hover:bg-white/[0.05]",
        props.class
      )}
    />
  );
};

export const Button = {
  Destructive,
  Primary,
  Secondary,
  Tertiary,
};
