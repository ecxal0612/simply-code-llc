"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "~/components/confirm-delete-dialog";

export function DeletePageButton({
  pageId,
  title,
  isSystem = false,
}: {
  pageId: string;
  title: string;
  isSystem?: boolean;
}) {
  const router = useRouter();

  async function handleDelete() {
    try {
      const res = await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not delete page");
      }
      toast.success("Page deleted");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete page",
      );
      throw error;
    }
  }

  return (
    <ConfirmDeleteDialog
      title="Delete this page?"
      description={
        isSystem
          ? `"${title}" is a built-in page. Deleting it removes it from the site until you restore or recreate it. This cannot be undone.`
          : `"${title}" will be removed from the site permanently. This action cannot be undone.`
      }
      onConfirm={handleDelete}
    />
  );
}
