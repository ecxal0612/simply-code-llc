"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "~/server/db/schema";

export function UserRoleSelect({
  userId,
  value,
  disabled,
}: {
  userId: string;
  value: UserRole;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(value);
  const [saving, setSaving] = useState(false);

  async function handleChange(nextRole: UserRole) {
    if (nextRole === role) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not update role");
      }
      setRole(nextRole);
      toast.success("User role updated");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update role",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative flex items-center gap-2">
      <select
        value={role}
        disabled={disabled || saving}
        onChange={(event) => void handleChange(event.target.value as UserRole)}
        className="border-input h-8 rounded-md border bg-transparent px-2 text-sm capitalize"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      {saving ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
    </div>
  );
}
