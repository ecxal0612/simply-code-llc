import "server-only";

import { and, asc, eq, inArray, ne, notInArray } from "drizzle-orm";
import { getDefaultPageImageUrl } from "~/lib/pages/image-slots";
import type { PageSectionContent, PageStatus } from "~/lib/pages/types";
import { reservedPageSlugs, slugifyPageTitle } from "~/lib/pages/types";
import { db } from "~/server/db";
import { images, pageSections, pages, users } from "~/server/db/schema";
import { defaultPages } from "~/server/pages/defaults";
import { syncAboutTeamMembers } from "~/server/team";
import {
  deleteManagedUpload,
  isManagedUploadUrl,
} from "~/server/uploadthing-cleanup";

export type PageRecord = typeof pages.$inferSelect;
export type PageSectionRecord = typeof pageSections.$inferSelect;
export type PageWithSections = PageRecord & { sections: PageSectionRecord[] };
export type ImageRecord = typeof images.$inferSelect;

let seedPromise: Promise<void> | null = null;

async function seedDefaultPages() {
  for (const definition of defaultPages) {
    const [insertedPage] = await db
      .insert(pages)
      .values({
        title: definition.title,
        slug: definition.slug,
        path: definition.path,
        status: definition.status,
        isSystem: true,
        body: null,
      })
      .onConflictDoNothing({ target: pages.path })
      .returning();

    const page =
      insertedPage ??
      (await db.query.pages.findFirst({
        where: eq(pages.path, definition.path),
      }));

    if (!page) continue;

    for (const [index, section] of definition.sections.entries()) {
      await db
        .insert(pageSections)
        .values({
          pageId: page.id,
          key: section.key,
          label: section.label,
          kind: section.kind,
          content: section.content,
          sortOrder: index,
        })
        .onConflictDoNothing({
          target: [pageSections.pageId, pageSections.key],
        });
    }

    // Remove retired built-in sections (for example the old homepage "why" section).
    const sectionKeys = definition.sections.map((section) => section.key);
    if (sectionKeys.length > 0) {
      await db
        .delete(pageSections)
        .where(
          and(
            eq(pageSections.pageId, page.id),
            notInArray(pageSections.key, sectionKeys),
          ),
        );
    }

    // The homepage Team section no longer supports section images.
    if (definition.path === "/") {
      const teamSection = await db.query.pageSections.findFirst({
        where: and(
          eq(pageSections.pageId, page.id),
          eq(pageSections.key, "team"),
        ),
      });
      if (teamSection) {
        const content: PageSectionContent = { ...teamSection.content };
        let changed = false;
        if (content.images?.length) {
          delete content.images;
          changed = true;
        }
        if ((content.items?.length ?? 0) > 1) {
          content.items = content.items?.slice(0, 1);
          changed = true;
        }
        if (changed) {
          await db
            .update(pageSections)
            .set({ content, updatedAt: new Date() })
            .where(eq(pageSections.id, teamSection.id));
        }
      }
    }

    // Blog posts now come from the posts table instead of editable section items.
    if (definition.path === "/blog") {
      const blogSection = await db.query.pageSections.findFirst({
        where: and(
          eq(pageSections.pageId, page.id),
          eq(pageSections.key, "posts"),
        ),
      });
      if (blogSection?.content.items?.length) {
        const content: PageSectionContent = { ...blogSection.content };
        delete content.items;
        await db
          .update(pageSections)
          .set({ content, updatedAt: new Date() })
          .where(eq(pageSections.id, blogSection.id));
      }
    }

    for (const section of definition.sections) {
      for (const image of section.content.images ?? []) {
        await db
          .insert(images)
          .values({
            pageId: page.id,
            sectionKey: section.key,
            slot: image.slot,
            url: getDefaultPageImageUrl(image.slot),
            name: `default-${image.slot}`,
          })
          .onConflictDoUpdate({
            target: images.slot,
            set: { pageId: page.id, sectionKey: section.key },
          });
      }
    }
  }

  await syncAboutTeamMembers();
}

/** Seeds the built-in marketing pages once per server process (without overwriting edits). */
export function ensurePagesSeeded(): Promise<void> {
  seedPromise ??= seedDefaultPages().catch((error: unknown) => {
    seedPromise = null;
    throw error;
  });
  return seedPromise;
}

function withSections(
  page: PageRecord,
  sections: PageSectionRecord[],
): PageWithSections {
  return { ...page, sections };
}

export async function listPages(): Promise<PageRecord[]> {
  await ensurePagesSeeded();
  return db.query.pages.findMany({
    orderBy: [asc(pages.createdAt)],
  });
}

export type PageWithCreator = PageRecord & {
  creatorName: string | null;
  creatorEmail: string | null;
};

export async function listPagesWithCreators(): Promise<PageWithCreator[]> {
  await ensurePagesSeeded();
  const rows = await db
    .select({
      page: pages,
      creatorName: users.name,
      creatorEmail: users.email,
    })
    .from(pages)
    .leftJoin(users, eq(pages.createdById, users.id))
    .orderBy(asc(pages.createdAt));

  return rows.map((row) => ({
    ...row.page,
    creatorName: row.creatorName,
    creatorEmail: row.creatorEmail,
  }));
}

export async function getPageById(
  id: string,
): Promise<PageWithSections | null> {
  await ensurePagesSeeded();
  const page = await db.query.pages.findFirst({
    where: eq(pages.id, id),
  });
  if (!page) return null;

  const sections = await db.query.pageSections.findMany({
    where: eq(pageSections.pageId, page.id),
    orderBy: [asc(pageSections.sortOrder), asc(pageSections.createdAt)],
  });

  return withSections(page, sections);
}

export async function getPageByPath(
  path: string,
  { includeDrafts = false }: { includeDrafts?: boolean } = {},
): Promise<PageWithSections | null> {
  await ensurePagesSeeded();
  const page = await db.query.pages.findFirst({
    where: eq(pages.path, path),
  });
  if (!page) return null;
  if (!includeDrafts && page.status !== "published") return null;

  const sections = await db.query.pageSections.findMany({
    where: eq(pageSections.pageId, page.id),
    orderBy: [asc(pageSections.sortOrder), asc(pageSections.createdAt)],
  });

  return withSections(page, sections);
}

async function uniqueSlug(
  baseValue: string,
  excludeId?: string,
): Promise<string> {
  let base = slugifyPageTitle(baseValue) || "page";
  if (reservedPageSlugs.has(base)) {
    base = `${base}-page`;
  }

  let candidate = base;
  let counter = 1;
  // System page routes are also reserved (they exist in the pages table).
  for (;;) {
    const existing = await db.query.pages.findFirst({
      where: excludeId
        ? and(eq(pages.slug, candidate), ne(pages.id, excludeId))
        : eq(pages.slug, candidate),
      columns: { id: true },
    });
    if (!existing) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

export async function createPage(input: {
  title: string;
  slug?: string;
  status: PageStatus;
  body: string | null;
  createdById: string;
}): Promise<PageRecord> {
  await ensurePagesSeeded();
  const slug = await uniqueSlug(input.slug || input.title);

  const [page] = await db
    .insert(pages)
    .values({
      title: input.title,
      slug,
      path: `/${slug}`,
      status: input.status,
      isSystem: false,
      body: input.body,
      createdById: input.createdById,
    })
    .returning();

  if (!page) {
    throw new Error("Failed to create page");
  }

  return page;
}

export async function updatePage(
  id: string,
  input: {
    title?: string;
    slug?: string;
    status?: PageStatus;
    body?: string | null;
  },
): Promise<PageRecord | null> {
  const existing = await db.query.pages.findFirst({ where: eq(pages.id, id) });
  if (!existing) return null;

  let slug = existing.slug;
  let path = existing.path;

  if (!existing.isSystem && input.slug && input.slug !== existing.slug) {
    slug = await uniqueSlug(input.slug, existing.id);
    path = `/${slug}`;
  }

  const [updated] = await db
    .update(pages)
    .set({
      title: input.title ?? existing.title,
      slug,
      path,
      status: input.status ?? existing.status,
      body: input.body === undefined ? existing.body : input.body,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id))
    .returning();

  return updated ?? null;
}

/** Removes a page and its sections (cascade). */
export async function deletePage(id: string): Promise<boolean> {
  const existing = await db.query.pages.findFirst({ where: eq(pages.id, id) });
  if (!existing) return false;

  const [deleted] = await db
    .delete(pages)
    .where(eq(pages.id, id))
    .returning({ id: pages.id });
  return Boolean(deleted);
}

export async function updatePageSection(
  pageId: string,
  sectionId: string,
  content: PageSectionContent,
): Promise<PageSectionRecord | null> {
  const section = await db.query.pageSections.findFirst({
    where: and(eq(pageSections.id, sectionId), eq(pageSections.pageId, pageId)),
  });
  if (!section) return null;

  const [updated] = await db
    .update(pageSections)
    .set({ content, updatedAt: new Date() })
    .where(eq(pageSections.id, sectionId))
    .returning();

  return updated ?? null;
}

/** Resolves slot-based section images from the database, falling back to built-in defaults. */
export async function getImageUrlsForSections(
  sections: PageSectionRecord[],
): Promise<Record<string, string>> {
  const slots = Array.from(
    new Set(
      sections.flatMap((section) =>
        (section.content.images ?? []).map((image) => image.slot),
      ),
    ),
  );

  const urls: Record<string, string> = {};
  for (const slot of slots) {
    urls[slot] = getDefaultPageImageUrl(slot);
  }
  if (slots.length === 0) return urls;

  const rows = await db.query.images.findMany({
    where: inArray(images.slot, slots),
    columns: { slot: true, url: true },
  });

  for (const row of rows) {
    if (row.slot && row.url) {
      urls[row.slot] = row.url;
    }
  }

  return urls;
}

export async function getPageImageById(
  id: string,
): Promise<ImageRecord | null> {
  const image = await db.query.images.findFirst({ where: eq(images.id, id) });
  return image ?? null;
}

export async function preparePageSectionImage(input: {
  pageId: string;
  sectionKey: string;
  slot: string;
}): Promise<ImageRecord> {
  const page = await db.query.pages.findFirst({
    where: eq(pages.id, input.pageId),
    columns: { id: true },
  });
  if (!page) throw new Error("Page not found");

  const section = await db.query.pageSections.findFirst({
    where: and(
      eq(pageSections.pageId, input.pageId),
      eq(pageSections.key, input.sectionKey),
    ),
  });
  if (!section) throw new Error("Page section not found");

  const imageSlots = (section.content.images ?? []).map((image) => image.slot);
  if (!imageSlots.includes(input.slot)) {
    throw new Error("Image slot is not part of this section");
  }

  const [row] = await db
    .insert(images)
    .values({
      pageId: page.id,
      sectionKey: section.key,
      slot: input.slot,
      url: getDefaultPageImageUrl(input.slot),
      name: `default-${input.slot}`,
    })
    .onConflictDoUpdate({
      target: images.slot,
      set: { pageId: page.id, sectionKey: section.key },
    })
    .returning();

  if (!row) throw new Error("Failed to prepare image");
  return row;
}

export async function prepareInlinePageImage(
  pageId: string,
): Promise<ImageRecord> {
  const page = await db.query.pages.findFirst({
    where: eq(pages.id, pageId),
    columns: { id: true },
  });
  if (!page) throw new Error("Page not found");

  const [row] = await db
    .insert(images)
    .values({
      pageId: page.id,
      url: "",
      name: "pending-upload",
      mimeType: null,
    })
    .returning();

  if (!row) throw new Error("Failed to prepare inline image");
  return row;
}

export async function updateImageFromUpload(
  id: string,
  input: { url: string; name?: string; size?: number; mimeType?: string },
): Promise<ImageRecord | null> {
  const existing = await db.query.images.findFirst({
    where: eq(images.id, id),
  });
  if (!existing) return null;

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
    .where(eq(images.id, id))
    .returning();

  return updated ?? null;
}
