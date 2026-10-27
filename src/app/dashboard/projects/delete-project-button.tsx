"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "~/components/confirm-delete-dialog";

export function DeleteProjectButton({
  projectId,
  title,
}: {
  projectId: string;
  title: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not delete project");
      }
      toast.success("Project deleted");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete project",
      );
      throw error;
    }
  }

  return (
    <ConfirmDeleteDialog
      title="Delete this project?"
      description={`"${title}" will be removed from the dashboard and will no longer appear in page sections. This cannot be undone.`}
      onConfirm={handleDelete}
    />
  );
}
