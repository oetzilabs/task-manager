import { twMerge } from "tailwind-merge";
import type { ClassNameValue } from "tailwind-merge";

export const classNames = (...classes: ClassNameValue[]) => twMerge(classes);
