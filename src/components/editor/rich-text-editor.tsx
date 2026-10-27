"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  registerRichTextPendingEditor,
  type RichTextUploadContext,
} from "~/components/editor/rich-text-pending";
import { Button } from "~/components/ui/button";
import { useUploadThing } from "~/lib/uploadthing";
import { cn } from "~/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  pageId?: string;
  postId?: string;
  className?: string;
};

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className={cn("size-8", active && "bg-muted text-foreground")}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

function Toolbar({
  editor,
  onQueueImage,
}: {
  editor: Editor | null;
  onQueueImage: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="bg-muted/40 flex flex-wrap items-center gap-1 border-b p-2">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="size-4" />
      </ToolbarButton>
      <span className="bg-border mx-1 h-6 w-px" aria-hidden />
      <ToolbarButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>
      <span className="bg-border mx-1 h-6 w-px" aria-hidden />
      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Link"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        <LinkIcon className="size-4" />
      </ToolbarButton>
      <span className="bg-border mx-1 h-6 w-px" aria-hidden />
      <ToolbarButton
        label="Add image"
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="size-4" />
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onQueueImage(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  pageId,
  postId,
  className,
}: RichTextEditorProps) {
  const idsRef = useRef<RichTextUploadContext>({ pageId, postId });
  const pendingFilesRef = useRef<Map<string, File>>(new Map());
  const onChangeRef = useRef(onChange);
  const { startUpload } = useUploadThing("pageImage");

  useEffect(() => {
    idsRef.current = { pageId, postId };
    onChangeRef.current = onChange;
  }, [pageId, postId, onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: "max-w-full h-auto" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Start writing…",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "rich-text-editor min-h-[220px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChangeRef.current(current.getHTML());
    },
  });

  const queueImage = useCallback(
    (file: File) => {
      if (!editor) return;
      const blobUrl = URL.createObjectURL(file);
      pendingFilesRef.current.set(blobUrl, file);
      editor.chain().focus().setImage({ src: blobUrl, alt: file.name }).run();
      toast.message("Image queued — it will upload when you save.");
    },
    [editor],
  );

  const commitPendingUploads = useCallback(
    async (override?: RichTextUploadContext): Promise<string> => {
      if (!editor) return value;

      const ctx = {
        pageId: override?.pageId ?? idsRef.current.pageId,
        postId: override?.postId ?? idsRef.current.postId,
      };

      if (!ctx.pageId && !ctx.postId) {
        if (pendingFilesRef.current.size > 0) {
          throw new Error(
            "Save the page or post first, then save again to upload images.",
          );
        }
        return editor.getHTML();
      }

      let html = editor.getHTML();

      for (const [blobUrl, file] of pendingFilesRef.current.entries()) {
        if (!html.includes(blobUrl)) continue;

        const prepareRes = await fetch(
          ctx.pageId ? "/api/page-images/inline" : "/api/post-images/inline",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              ctx.pageId ? { pageId: ctx.pageId } : { postId: ctx.postId },
            ),
          },
        );
        const prepared = (await prepareRes.json().catch(() => null)) as {
          imageId?: string;
          error?: string;
        } | null;
        if (!prepareRes.ok || !prepared?.imageId) {
          throw new Error(
            prepared?.error ?? "Could not register the image in the database",
          );
        }

        const uploaded = await startUpload([file], {
          imageId: prepared.imageId,
        });
        const url = uploaded?.[0]?.ufsUrl ?? uploaded?.[0]?.url;
        if (!url) throw new Error("Upload did not return a URL");

        html = html.replaceAll(blobUrl, url);
        URL.revokeObjectURL(blobUrl);
        pendingFilesRef.current.delete(blobUrl);
      }

      editor.commands.setContent(html, { emitUpdate: false });
      onChangeRef.current(html);
      return html;
    },
    [editor, startUpload, value],
  );

  useEffect(() => {
    if (!editor) return;
    return registerRichTextPendingEditor({ commitPendingUploads });
  }, [editor, commitPendingUploads]);

  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  return (
    <div
      className={cn(
        "bg-background overflow-hidden rounded-md border",
        className,
      )}
    >
      <Toolbar editor={editor} onQueueImage={queueImage} />
      <p className="text-muted-foreground border-b px-3 py-1.5 text-[11px]">
        Inline images upload to the database and Uploadthing when you save.
      </p>
      <EditorContent editor={editor} />
    </div>
  );
}
