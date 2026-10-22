"use client";

import "@uploadthing/react/styles.css";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { homepageImageSections } from "~/lib/home/image-slots";
import type { HomepageImageSlotId } from "~/lib/home/image-slots";
import { UploadButton } from "~/lib/uploadthing";
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

function HomepageImageSlotCard({ slot }: { slot: SlotRow }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/10] w-full bg-muted">
        <Image src={slot.url} alt={slot.label} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
      </div>
      <CardHeader className="space-y-1 pb-3">
        <p className="text-xs font-medium tracking-wide text-[#4682B4] uppercase">{slot.sectionTitle}</p>
        <CardTitle className="text-base">{slot.label}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{slot.description}</CardDescription>
        <p className="font-mono text-xs text-muted-foreground">Slot: {slot.id}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <p className="text-xs text-muted-foreground">
          {slot.isCustom ? "Using a custom image from your library." : "Using the default placeholder until you upload."}
        </p>
        <UploadButton
          endpoint="homepageImage"
          input={{ slot: slot.id }}
          appearance={{
            button: cn(
              "ut-ready:bg-[#4169E1] ut-uploading:cursor-not-allowed ut-uploading:bg-[#4682B4]/80",
              "h-9 w-full rounded-md text-sm font-medium text-white",
            ),
            allowedContent: "text-xs text-muted-foreground",
          }}
          content={{
            button({ ready, isUploading }) {
              if (isUploading || uploading) return "Uploading…";
              if (ready) return "Upload new image";
              return "Preparing…";
            },
          }}
          onBeforeUploadBegin={async (files) => {
            setUploading(true);
            try {
              await prepareSlot(slot.id);
              return files;
            } catch (error) {
              setUploading(false);
              toast.error(error instanceof Error ? error.message : "Could not prepare upload");
              throw error;
            }
          }}
          onClientUploadComplete={() => {
            setUploading(false);
            toast.success(`${slot.label} updated`);
            void queryClient.invalidateQueries({ queryKey: ["homepage-images"] });
          }}
          onUploadError={(error) => {
            setUploading(false);
            toast.error(error.message);
          }}
        />
      </CardContent>
    </Card>
  );
}

export function HomepageImagesManager() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["homepage-images"],
    queryFn: fetchHomepageImageSlots,
  });

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Homepage images</h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Update photos shown on the public homepage. Each upload is registered in the database first, then sent to
          Uploadthing. The live site uses the stored URL after a successful upload.
        </p>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading image slots…</p> : null}
      {error ? <p className="text-sm text-destructive">Could not load homepage images.</p> : null}

      {homepageImageSections.map((section) => {
        const sectionSlots = data?.filter((slot) => slot.sectionId === section.id) ?? [];
        if (sectionSlots.length === 0) return null;

        return (
          <div key={section.id} className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide uppercase">{section.title}</h3>
            <div
              className={cn(
                "grid gap-4",
                section.id === "team" ? "sm:grid-cols-2" : "max-w-xl",
              )}
            >
              {sectionSlots.map((slot) => (
                <HomepageImageSlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
