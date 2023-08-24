import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { CopyPlus, PenLine, Trash, X } from "lucide-solid";
import { A } from "solid-start";
import { TaskSelect } from "../db/schema";
import { PriorityColors } from "../utils/colors";
dayjs.extend(advancedFormat);

interface TaskProps {
  task: TaskSelect;
}

export const Task = (props: TaskProps) => {
  return (
    <div class="w-full p-4 border rounded-sm">
      <div class="w-full flex flex-row justify-between">
        <div class="flex-1 flex flex-col gap-2">
          <div class="flex flex-row gap-1">
            <A href={`/tasks/${props.task.id}`}>
              <h2 class="text-xl font-bold hover:underline underline-offset-2">{props.task.title}</h2>
            </A>
          </div>
          <div class="text-xs text-neutral-400">{dayjs(props.task.dueDate).format("Do MMMM YYYY")}</div>
          <div class="text-sm">{props.task.description}</div>
          <div class="flex flex-row gap-2 ">
            <A href={`/tasks/${props.task.id}/duplicate`}>
              <button class="border flex gap-1 items-center bg-white text-black py-1 px-2 rounded-sm hover:bg-neutral-100">
                <CopyPlus size={16} />
                <span>Duplicate</span>
              </button>
            </A>
            <A href={`/tasks/${props.task.id}/edit`}>
              <button class="flex gap-1 items-center bg-black text-white py-1 px-2 rounded-sm hover:bg-neutral-900">
                <PenLine size={16} />
                <span>Edit</span>
              </button>
            </A>
            <A href={`/tasks/${props.task.id}/delete`}>
              <button class="flex gap-1 items-center bg-red-500 text-white py-1 px-2 rounded-sm hover:bg-red-600">
                <Trash size={16} />
                <span>Delete</span>
              </button>
            </A>
          </div>
        </div>
        <div class="relative w-max flex flex-col gap-2 items-end">
          <div class="flex flex-row gap-2 items-center">
            <div
              class="w-3 h-3 rounded-full"
              style={{
                ["background-color"]: PriorityColors[props.task.priority],
              }}
            />
            <div
              class="text-sm"
              style={{
                color: PriorityColors[props.task.priority],
              }}
            >
              {props.task.priority}
            </div>
          </div>
          <div class="text-xs text-neutral-400">{props.task.status}</div>
        </div>
      </div>
    </div>
  );
};
