import { Select as S } from "@kobalte/core";
import { JSX } from "solid-js";
import { Check } from "~/components/icons/check";
import { ChevronDown } from "~/components/icons/chevron-down";
import { classNames } from "../utils/css";
// take instric attr from the select component
type SelectProps<T> = JSX.HTMLAttributes<HTMLSelectElement> & {
  name?: string;
  options: T[];
  defaultValue?: T;
  placeholder?: string;
  disabled?: boolean;
  classes?: {
    root: string;
    label: string;
    item: string;
    itemIndicator: string;
    itemLabel: string;
    trigger: string;
    content: string;
    listbox: string;
  };
};

export const Select = <T extends string>(props: SelectProps<T>) => {
  return (
    <S.Root
      name={props.name}
      options={props.options}
      placeholder={props.placeholder}
      defaultValue={props.defaultValue}
      class={classNames(props.classes?.root)}
      itemComponent={(_props) => (
        <S.Item
          item={_props.item}
          class={classNames(
            "flex flex-row gap-2 justify-between items-center w-full hover:bg-neutral-200 dark:hover:bg-neutral-800 py-1 px-2 rounded-sm cursor-pointer text-black dark:text-white",
            props.classes?.item
          )}
        >
          <S.ItemLabel class={classNames(props.classes?.itemLabel)}>{_props.item.rawValue}</S.ItemLabel>
          <S.ItemIndicator class={classNames(props.classes?.itemIndicator, "text-black dark:text-white")}>
            <Check size={14} />
          </S.ItemIndicator>
        </S.Item>
      )}
    >
      <S.Label class={classNames("font-semibold", props.classes?.label)}>{props.children}</S.Label>
      <S.HiddenSelect />
      <S.Trigger
        class={classNames(
          "border dark:border-neutral-800 flex flex-row gap-2 items-center outline-none bg-neutral-100 dark:bg-neutral-950 w-max px-3 py-1 rounded-sm",
          props.classes?.trigger
        )}
      >
        <S.Value<T>>{(state) => state.selectedOption()}</S.Value>
        <S.Icon class="text-black dark:text-white">
          <ChevronDown size={16} />
        </S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Content
          class={classNames(
            "w-full flex flex-col bg-neutral-100 dark:bg-neutral-950 p-1 rounded-sm border dark:border-neutral-800",
            props.classes?.content
          )}
        >
          <S.Listbox class={classNames("w-full flex flex-col", props.classes?.listbox)} />
        </S.Content>
      </S.Portal>
    </S.Root>
  );
};
