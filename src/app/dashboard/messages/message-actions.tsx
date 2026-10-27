"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "~/components/confirm-delete-dialog";
import { Button } from "~/components/ui/button";

async function patchMessage(id: string, action: "archive" | "unarchive") {
  const res = await fetch(`/api/contact-messages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) {
    throw new Error(data?.error ?? "Could not update the message.");
  }
}

export function MessageActions({
  messageId,
  senderName,
  archived,
  redirectAfterDelete,
}: {
  messageId: string;
  senderName: string;
  archived: boolean;
  redirectAfterDelete?: string;
}) {
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);

  async function handleArchiveToggle() {
    setArchiving(true);
    try {
      await patchMessage(messageId, archived ? "unarchive" : "archive");
      toast.success(archived ? "Message restored to inbox" : "Message archived");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update the message.",
      );
    } finally {
      setArchiving(false);
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/contact-messages/${messageId}`, {
      method: "DELETE",
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      throw new Error(data?.error ?? "Could not delete the message.");
    }
    toast.success("Message deleted");
    if (redirectAfterDelete) {
      router.push(redirectAfterDelete);
    }
    router.refresh();
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={archiving}
        onClick={() => void handleArchiveToggle()}
      >
        {archiving ? (
          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
        ) : archived ? (
          <ArchiveRestore className="mr-1.5 size-3.5" />
        ) : (
          <Archive className="mr-1.5 size-3.5" />
        )}
        {archived ? "Unarchive" : "Archive"}
      </Button>
      <ConfirmDeleteDialog
        title="Delete this message?"
        description={`The inquiry from ${senderName} will be removed permanently. This action cannot be undone.`}
        confirmLabel="Delete message"
        onConfirm={handleDelete}
      />
    </div>
  );
}
