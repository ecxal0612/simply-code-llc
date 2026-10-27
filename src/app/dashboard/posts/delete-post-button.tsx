"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "~/components/confirm-delete-dialog";

export function DeletePostButton({
  postId,
  title,
  redirectToList = false,
}: {
  postId: string;
  title: string;
  redirectToList?: boolean;
}) {
  const router = useRouter();

  async function handleDelete() {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not delete post");
      }
      toast.success("Post deleted");
      if (redirectToList) {
        router.push("/dashboard/posts");
      }
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete post",
      );
      throw error;
    }
  }

  return (
    <ConfirmDeleteDialog
      title="Delete this post?"
      description={`"${title}" will be removed from the blog permanently. This action cannot be undone.`}
      onConfirm={handleDelete}
    />
  );
}
