import "server-only";

import { eq } from "drizzle-orm";
import {
  DEFAULT_HEADER_NAV_PATHS,
  SITE_LOGO_SLOT,
  type SiteNavItem,
} from "~/lib/site/header";
import { db } from "~/server/db";
import { images, siteSettings } from "~/server/db/schema";
import {
  deleteManagedUpload,
  isManagedUploadUrl,
} from "~/server/uploadthing-cleanup";

const SETTINGS_ID = "default";

async function getOrCreateSettingsRow() {
  const existing = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.singleton, SETTINGS_ID),
  });
  if (existing) return existing;

  const [inserted] = await db
    .insert(siteSettings)
    .values({ singleton: SETTINGS_ID, headerNavPaths: [] })
    .onConflictDoNothing({ target: siteSettings.singleton })
    .returning();

  return (
    inserted ??
    (await db.query.siteSettings.findFirst({
      where: eq(siteSettings.singleton, SETTINGS_ID),
    }))
  );
}

export async function getStoredHeaderNavPaths(): Promise<string[]> {
  const row = await getOrCreateSettingsRow();
  const paths = row?.headerNavPaths ?? [];
  if (paths.length === 0) {
    return [...DEFAULT_HEADER_NAV_PATHS];
  }
  return paths;
}

export async function updateHeaderNavPaths(paths: string[]): Promise<string[]> {
  await getOrCreateSettingsRow();
  const unique = Array.from(
    new Set(paths.map((path) => path.trim()).filter(Boolean)),
  );

  await db
    .update(siteSettings)
    .set({ headerNavPaths: unique, updatedAt: new Date() })
    .where(eq(siteSettings.singleton, SETTINGS_ID));

  return unique.length > 0 ? unique : [...DEFAULT_HEADER_NAV_PATHS];
}

export async function resolveHeaderNavItems(): Promise<SiteNavItem[]> {
  const paths = await getStoredHeaderNavPaths();
  const pageRows = await db.query.pages.findMany({
    columns: { path: true, title: true, status: true },
  });
  const pageByPath = new Map(pageRows.map((page) => [page.path, page]));

  const items: SiteNavItem[] = [];
  for (const path of paths) {
    const page = pageByPath.get(path);
    if (page) {
      if (page.status !== "published") continue;
      items.push({ href: path, label: page.title });
      continue;
    }
    if (path === "/blog") {
      items.push({ href: "/blog", label: "Blog" });
    }
  }
  return items;
}

export async function getSiteLogoUrl(): Promise<string | null> {
  const row = await db.query.images.findFirst({
    where: eq(images.slot, SITE_LOGO_SLOT),
    columns: { url: true },
  });
  const url = row?.url?.trim();
  if (!url || url.startsWith("pending:")) return null;
  return url;
}

export async function prepareSiteLogoImage() {
  const existing = await db.query.images.findFirst({
    where: eq(images.slot, SITE_LOGO_SLOT),
  });
  if (existing) return existing;

  const [inserted] = await db
    .insert(images)
    .values({
      slot: SITE_LOGO_SLOT,
      url: "pending:site-logo",
      name: "site-logo-pending",
    })
    .returning();

  if (!inserted) throw new Error("Failed to prepare site logo row");
  return inserted;
}

export async function hasPreparedSiteLogo(): Promise<boolean> {
  const row = await db.query.images.findFirst({
    where: eq(images.slot, SITE_LOGO_SLOT),
    columns: { id: true },
  });
  return Boolean(row);
}

export async function updateSiteLogoFromUpload(input: {
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
}) {
  const existing = await db.query.images.findFirst({
    where: eq(images.slot, SITE_LOGO_SLOT),
  });
  if (!existing) {
    throw new Error("Site logo not prepared in database");
  }

  if (
    existing.url &&
    existing.url !== input.url &&
    isManagedUploadUrl(existing.url)
  ) {
    await deleteManagedUpload(existing.url);
  }

  const [updated] = await db
    .update(images)
    .set({
      url: input.url,
      name: input.name ?? existing.name,
      size: input.size ?? existing.size,
      mimeType: input.mimeType ?? existing.mimeType,
    })
    .where(eq(images.id, existing.id))
    .returning();

  return updated;
}
