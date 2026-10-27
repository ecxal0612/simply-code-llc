export type RichTextUploadContext = {
  pageId?: string;
  postId?: string;
};

type PendingEditor = {
  commitPendingUploads: (ctx?: RichTextUploadContext) => Promise<string>;
};

const pendingEditors = new Set<PendingEditor>();

export function registerRichTextPendingEditor(editor: PendingEditor) {
  pendingEditors.add(editor);
  return () => {
    pendingEditors.delete(editor);
  };
}

export async function commitAllRichTextPendingUploads(
  ctx?: RichTextUploadContext,
): Promise<void> {
  for (const editor of pendingEditors) {
    await editor.commitPendingUploads(ctx);
  }
}
