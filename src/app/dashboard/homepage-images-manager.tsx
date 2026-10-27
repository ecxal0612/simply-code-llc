"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { homepageImageSections } from "~/lib/home/image-slots";
import type { HomepageImageSlotId } from "~/lib/home/image-slots";
import { useUploadThing } from "~/lib/uploadthing";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type SlotRow = {
  id: HomepageImageSlotId;
  sectionId: "hero" | "experience" | "team";
  sectionTitle: string;
  label: string;
  description: string;
  url: string;
  imageId: string | null;
  isCustom: boolean;
};

async function fetchHomepageImageSlots(): Promise<SlotRow[]> {
  const res = await fetch("/api/homepage-images");
  if (!res.ok) throw new Error("Failed to load homepage images");
  const data = (await res.json()) as { slots: SlotRow[] };
  return data.slots;
}

async function prepareSlot(slot: HomepageImageSlotId) {
  const res = await fetch("/api/homepage-images/prepare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slot }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Could not prepare image slot");
  }
}

function HomepageImageSlotCard({
  slot,
  pendingFile,
  previewUrl,
  onSelectFile,
}: {
  slot: SlotRow;
  pendingFile: File | null;
  previewUrl: string | null;
  onSelectFile: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayUrl = previewUrl ?? slot.url;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/10] w-full bg-muted">
        <Image
          src={displayUrl}
          alt={slot.label}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized={Boolean(previewUrl)}
        />
      </div>
      <CardHeader className="space-y-1 pb-3">
        <p className="text-xs font-medium tracking-wide text-[#4682B4] uppercase">
          {slot.sectionTitle}
        </p>
        <CardTitle className="text-base">{slot.label}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {slot.description}
        </CardDescription>
        <p className="font-mono text-xs text-muted-foreground">Slot: {slot.id}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <p className="text-xs text-muted-foreground">
          {pendingFile
            ? "New image queued — uploads when you save homepage images."
            : slot.isCustom
              ? "Using a custom image from your library."
              : "Using the default placeholder until you upload."}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onSelectFile(file);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="mr-2 size-4" />
          {pendingFile ? "Replace queued image" : "Choose image"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function HomepageImagesManager() {
  const queryClient = useQueryClient();
  const { startUpload } = useUploadThing("homepageImage");
  const [pendingBySlot, setPendingBySlot] = useState<
    Record<string, { file: File; previewUrl: string }>
  >({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["homepage-images"],
    queryFn: fetchHomepageImageSlots,
  });

  const pendingCount = Object.keys(pendingBySlot).length;

  function queueFile(slotId: HomepageImageSlotId, file: File) {
    setPendingBySlot((current) => {
      const previous = current[slotId];
      if (previous) URL.revokeObjectURL(previous.previewUrl);
      return {
        ...current,
        [slotId]: { file, previewUrl: URL.createObjectURL(file) },
      };
    });
    toast.message("Image queued — save homepage images to upload.");
  }

  async function handleSaveAll() {
    if (pendingCount === 0) {
      toast.error("Choose at least one image to upload.");
      return;
    }
    setSaving(true);
    try {
      for (const [slot, pending] of Object.entries(pendingBySlot)) {
        await prepareSlot(slot as HomepageImageSlotId);
        const uploaded = await startUpload([pending.file], {
          slot: slot as HomepageImageSlotId,
        });
        if (!uploaded?.[0]) {
          throw new Error(`Upload failed for ${slot}`);
        }
      }
      for (const pending of Object.values(pendingBySlot)) {
        URL.revokeObjectURL(pending.previewUrl);
      }
      setPendingBySlot({});
      toast.success("Homepage images saved");
      void queryClient.invalidateQueries({ queryKey: ["homepage-images"] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save images",
      );
    } finally {
      setSaving(false);
    }
  }

  const slotsBySection = useMemo(() => {
    const map = new Map<string, SlotRow[]>();
    for (const slot of data ?? []) {
      const list = map.get(slot.sectionId) ?? [];
      list.push(slot);
      map.set(slot.sectionId, list);
    }
    return map;
  }, [data]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Homepage images</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Choose images here, then save to register them in the database and
            upload to Uploadthing.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => void handleSaveAll()}
          disabled={saving || pendingCount === 0}
        >
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          Save homepage images
          {pendingCount > 0 ? ` (${pendingCount})` : ""}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading image slots…</p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive">Could not load homepage images.</p>
      ) : null}

      {homepageImageSections.map((section) => {
        const sectionSlots = slotsBySection.get(section.id) ?? [];
        if (sectionSlots.length === 0) return null;

        return (
          <div key={section.id} className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              {section.title}
            </h3>
            <div
              className={cn(
                "grid gap-4",
                section.id === "team" ? "sm:grid-cols-2" : "max-w-xl",
              )}
            >
              {sectionSlots.map((slot) => {
                const pending = pendingBySlot[slot.id];
                return (
                  <HomepageImageSlotCard
                    key={slot.id}
                    slot={slot}
                    pendingFile={pending?.file ?? null}
                    previewUrl={pending?.previewUrl ?? null}
                    onSelectFile={(file) => queueFile(slot.id, file)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
