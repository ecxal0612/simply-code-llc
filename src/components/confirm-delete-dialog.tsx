"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Trash2, type LucideIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type ConfirmDeleteDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerVariant?: "outline" | "ghost" | "destructive";
  triggerSize?: "sm" | "default";
  disabled?: boolean;
  triggerIcon?: LucideIcon;
};

export function ConfirmDeleteDialog({
  title,
  description,
  confirmLabel = "Delete permanently",
  onConfirm,
  triggerLabel = "Delete",
  triggerClassName,
  triggerVariant = "ghost",
  triggerSize = "sm",
  disabled = false,
  triggerIcon: TriggerIcon = Trash2,
}: ConfirmDeleteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        className={cn(
          triggerVariant === "ghost" &&
            "text-destructive hover:text-destructive",
          triggerClassName,
        )}
        disabled={disabled || pending}
        onClick={() => setOpen(true)}
      >
        <TriggerIcon className="mr-1.5 size-3.5" />
        {triggerLabel}
      </Button>
      <dialog
        ref={dialogRef}
        className="bg-background text-foreground fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border p-0 shadow-lg backdrop:bg-black/50 open:animate-in open:fade-in-0"
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold leading-none">{title}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={() => void handleConfirm()}
            >
              {pending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              {confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
