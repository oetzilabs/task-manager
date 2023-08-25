import { HTMLContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { createTiptapEditor, useEditorHTML } from "solid-tiptap";

interface EditorProps {
  content: HTMLContent;
  name: string;
  disabled?: boolean;
}

export function Editor(props: EditorProps) {
  let ref!: HTMLDivElement;

  const editor = createTiptapEditor(() => ({
    element: ref!,
    extensions: [StarterKit],
    content: props.content,
    editable: !props.disabled,
  }));

  const html = useEditorHTML(() => editor());

  return (
    <>
      <input type="hidden" name={props.name} value={html()} />
      <div id="editor" ref={ref} />
    </>
  );
}
