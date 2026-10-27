"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "~/components/confirm-delete-dialog";

export function DeleteTeamMemberButton({
  memberId,
  name,
}: {
  memberId: string;
  name: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    try {
      const res = await fetch(`/api/team/${memberId}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not delete team member");
      }

      toast.success("Team member deleted");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete team member",
      );
      throw error;
    }
  }

  return (
    <ConfirmDeleteDialog
      title="Delete this team member?"
      description={`"${name}" will be removed from the site and from About Us team sections. This action cannot be undone.`}
      onConfirm={handleDelete}
    />
  );
}
