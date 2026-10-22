import "server-only";

import { eq } from "drizzle-orm";
import { homeImages } from "~/lib/home/content";
import type { HomepageImageSlotId } from "~/lib/home/image-slots";
import { isHomepageImageSlotId } from "~/lib/home/image-slots";
import { db } from "~/server/db";
import { images } from "~/server/db/schema";

export type ResolvedHomepageImages = {
  hero: string;
  experience: string;
  team: [string, string, string, string];
};

export function getDefaultUrlForSlot(slot: HomepageImageSlotId): string {
  switch (slot) {
    case "home.hero":
      return homeImages.hero;
    case "home.experience":
      return homeImages.experience;
    case "home.team.0":
      return homeImages.team[0];
    case "home.team.1":
      return homeImages.team[1];
    case "home.team.2":
      return homeImages.team[2];
    case "home.team.3":
      return homeImages.team[3];
    default:
      return homeImages.hero;
  }
}

type HomepageImageRow = {
  id: string;
  slot: string | null;
  url: string;
  name: string | null;
  size: number | null;
  mimeType: string | null;
  createdAt: Date;
};

export async function getHomepageImagesBySlot(): Promise<Map<HomepageImageSlotId, HomepageImageRow>> {
  const rows = await db.query.images.findMany({
    columns: {
      id: true,
      slot: true,
      url: true,
      name: true,
      size: true,
      mimeType: true,
      createdAt: true,
    },
  });

  const map = new Map<HomepageImageSlotId, HomepageImageRow>();
  for (const row of rows) {
    if (row.slot && isHomepageImageSlotId(row.slot)) {
      map.set(row.slot, row);
    }
  }
  return map;
}

export async function getResolvedHomepageImages(): Promise<ResolvedHomepageImages> {
  const bySlot = await getHomepageImagesBySlot();
  return {
    hero: bySlot.get("home.hero")?.url ?? homeImages.hero,
    experience: bySlot.get("home.experience")?.url ?? homeImages.experience,
    team: [
      bySlot.get("home.team.0")?.url ?? homeImages.team[0],
      bySlot.get("home.team.1")?.url ?? homeImages.team[1],
      bySlot.get("home.team.2")?.url ?? homeImages.team[2],
      bySlot.get("home.team.3")?.url ?? homeImages.team[3],
    ],
  };
}

/** Ensures a DB row exists for the slot before Uploadthing runs (required upload order). */
export async function prepareHomepageImageSlot(slot: HomepageImageSlotId) {
  const existing = await db.query.images.findFirst({
    where: eq(images.slot, slot),
  });

  if (existing) {
    return existing;
  }

  const url = getDefaultUrlForSlot(slot);
  const [inserted] = await db
    .insert(images)
    .values({
      slot,
      url,
      name: `default-${slot}`,
      postId: null,
    })
    .returning();

  if (!inserted) {
    throw new Error("Failed to prepare homepage image slot");
  }

  return inserted;
}

export async function updateHomepageImageFromUpload({
  slot,
  url,
  name,
  size,
  mimeType,
}: {
  slot: HomepageImageSlotId;
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
}) {
  const existing = await db.query.images.findFirst({
    where: eq(images.slot, slot),
  });

  if (!existing) {
    throw new Error(`Homepage image slot not prepared: ${slot}`);
  }

  const [updated] = await db
    .update(images)
    .set({
      url,
      name: name ?? existing.name,
      size: size ?? existing.size,
      mimeType: mimeType ?? existing.mimeType,
    })
    .where(eq(images.id, existing.id))
    .returning();

  return updated;
}

export async function hasPreparedHomepageSlot(slot: HomepageImageSlotId): Promise<boolean> {
  const row = await db.query.images.findFirst({
    where: eq(images.slot, slot),
    columns: { id: true },
  });
  return !!row;
}
