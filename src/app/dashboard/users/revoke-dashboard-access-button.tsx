"use client";

import { useRouter } from "next/navigation";
import { UserX } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "~/components/confirm-delete-dialog";

export function RevokeDashboardAccessButton({
  userId,
  userLabel,
  disabled = false,
}: {
  userId: string;
  userLabel: string;
  disabled?: boolean;
}) {
  const router = useRouter();

  async function handleRevoke() {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revokeDashboardAccess: true }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      throw new Error(data?.error ?? "Could not remove dashboard access");
    }
    toast.success("Dashboard access removed");
    router.refresh();
  }

  return (
    <ConfirmDeleteDialog
      title="Remove dashboard access?"
      description={`${userLabel} will no longer be able to sign in to the dashboard. This action cannot be undone.`}
      confirmLabel="Remove access"
      triggerLabel="Remove access"
      triggerVariant="outline"
      disabled={disabled}
      onConfirm={handleRevoke}
      triggerIcon={UserX}
    />
  );
}
