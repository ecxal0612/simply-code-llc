import "server-only";

import { asc, eq, inArray } from "drizzle-orm";
import type { PageSectionContent } from "~/lib/pages/types";
import { collectProjectIdsFromItems } from "~/lib/projects/display";
import type { ProjectLink } from "~/server/db/schema";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { deleteManagedUpload } from "~/server/uploadthing-cleanup";

export type ProjectRecord = typeof projects.$inferSelect;

export async function listProjects(): Promise<ProjectRecord[]> {
  return db.query.projects.findMany({
    orderBy: [asc(projects.createdAt)],
  });
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });
  return project ?? null;
}

export async function getProjectsMapForPageSections(
  sections: { content: PageSectionContent }[],
): Promise<Map<string, ProjectRecord>> {
  const ids = [
    ...new Set(
      sections.flatMap((section) =>
        collectProjectIdsFromItems(section.content.items),
      ),
    ),
  ];
  return getProjectsByIds(ids);
}

export async function getProjectsByIds(
  ids: string[],
): Promise<Map<string, ProjectRecord>> {
  if (ids.length === 0) return new Map();
  const rows = await db.query.projects.findMany({
    where: inArray(projects.id, ids),
  });
  return new Map(rows.map((row) => [row.id, row]));
}

function normalizeLinks(links?: ProjectLink[]): ProjectLink[] {
  if (!links?.length) return [];
  return links
    .map((link) => ({
      label: link.label.trim(),
      url: link.url.trim(),
    }))
    .filter((link) => link.label && link.url);
}

export async function createProject(input: {
  title: string;
  description?: string | null;
  label?: string | null;
  projectDate?: string | null;
  imageUrl?: string | null;
  links?: ProjectLink[];
}): Promise<ProjectRecord> {
  const [project] = await db
    .insert(projects)
    .values({
      title: input.title,
      description: input.description?.trim() || null,
      label: input.label?.trim() || null,
      projectDate: input.projectDate?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
      links: normalizeLinks(input.links),
    })
    .returning();

  if (!project) throw new Error("Failed to create project");
  return project;
}

export async function updateProject(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    label?: string | null;
    projectDate?: string | null;
    imageUrl?: string | null;
    links?: ProjectLink[];
  },
): Promise<ProjectRecord | null> {
  const existing = await getProjectById(id);
  if (!existing) return null;

  if (
    input.imageUrl !== undefined &&
    existing.imageUrl &&
    existing.imageUrl !== (input.imageUrl?.trim() || null)
  ) {
    await deleteManagedUpload(existing.imageUrl);
  }

  const [project] = await db
    .update(projects)
    .set({
      title: input.title ?? existing.title,
      description:
        input.description === undefined
          ? existing.description
          : input.description?.trim() || null,
      label:
        input.label === undefined
          ? existing.label
          : input.label?.trim() || null,
      projectDate:
        input.projectDate === undefined
          ? existing.projectDate
          : input.projectDate?.trim() || null,
      imageUrl:
        input.imageUrl === undefined
          ? existing.imageUrl
          : input.imageUrl?.trim() || null,
      links: input.links === undefined ? existing.links : normalizeLinks(input.links),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  return project ?? null;
}

export async function deleteProject(id: string): Promise<boolean> {
  const existing = await getProjectById(id);
  if (!existing) return false;

  await deleteManagedUpload(existing.imageUrl);

  const [deleted] = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ id: projects.id });

  return Boolean(deleted);
}
