"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

export function RestoreDashboardAccessButton({
  userId,
  userLabel,
}: {
  userId: string;
  userLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleRestore() {
    setPending(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restoreDashboardAccess: true }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not restore dashboard access");
      }
      toast.success(`${userLabel} can access the dashboard again`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not restore dashboard access",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => void handleRestore()}
    >
      {pending ? (
        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
      ) : (
        <UserCheck className="mr-1.5 size-3.5" />
      )}
      Restore access
    </Button>
  );
}
