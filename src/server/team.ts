import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";
import type { PageSectionContent } from "~/lib/pages/types";
import { db } from "~/server/db";
import { pageSections, pages, teamMembers } from "~/server/db/schema";

export type TeamMemberRecord = typeof teamMembers.$inferSelect;

export type TeamMemberValues = {
  name: string;
  role: string | null;
  bio: string | null;
  imageUrl: string | null;
  technologies: string[];
};

export function normalizeTeamMemberValues(input: {
  name: string;
  role?: string;
  bio?: string;
  imageUrl?: string;
  technologies?: string[];
}): TeamMemberValues {
  return {
    name: input.name.trim(),
    role: input.role?.trim() || null,
    bio: input.bio?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    technologies: input.technologies ?? [],
  };
}

export async function listTeamMembers(): Promise<TeamMemberRecord[]> {
  return db.query.teamMembers.findMany({
    orderBy: [asc(teamMembers.createdAt), asc(teamMembers.name)],
  });
}

export async function getTeamMemberById(
  id: string,
): Promise<TeamMemberRecord | null> {
  const member = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.id, id),
  });
  return member ?? null;
}

/** Resolves team members while preserving the order of the supplied IDs. */
export async function getTeamMembersByIds(
  ids: string[],
): Promise<TeamMemberRecord[]> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return [];

  const rows = await db.query.teamMembers.findMany({
    where: inArray(teamMembers.id, uniqueIds),
  });
  const byId = new Map(rows.map((member) => [member.id, member]));

  return uniqueIds
    .map((id) => byId.get(id))
    .filter((member): member is TeamMemberRecord => Boolean(member));
}

export async function createTeamMember(
  input: TeamMemberValues,
): Promise<TeamMemberRecord> {
  const [member] = await db
    .insert(teamMembers)
    .values({
      name: input.name,
      role: input.role,
      bio: input.bio,
      imageUrl: input.imageUrl,
      technologies: input.technologies,
    })
    .returning();

  if (!member) throw new Error("Failed to create team member");
  return member;
}

export async function updateTeamMember(
  id: string,
  input: TeamMemberValues,
): Promise<TeamMemberRecord | null> {
  const [member] = await db
    .update(teamMembers)
    .set({
      name: input.name,
      role: input.role,
      bio: input.bio,
      imageUrl: input.imageUrl,
      technologies: input.technologies,
      updatedAt: new Date(),
    })
    .where(eq(teamMembers.id, id))
    .returning();

  return member ?? null;
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const [deleted] = await db
    .delete(teamMembers)
    .where(eq(teamMembers.id, id))
    .returning({ id: teamMembers.id });

  if (deleted) {
    await removeMemberFromAboutTeamSection(id);
  }

  return Boolean(deleted);
}

async function removeMemberFromAboutTeamSection(memberId: string) {
  const aboutPage = await db.query.pages.findFirst({
    where: eq(pages.path, "/about"),
    columns: { id: true },
  });
  if (!aboutPage) return;

  const section = await db.query.pageSections.findFirst({
    where: and(
      eq(pageSections.pageId, aboutPage.id),
      eq(pageSections.key, "team"),
    ),
  });
  if (!section) return;

  const items = section.content.items ?? [];
  if (!items.some((item) => item.memberId === memberId)) return;

  const content: PageSectionContent = {
    ...section.content,
    items: items.filter((item) => item.memberId !== memberId),
  };

  await db
    .update(pageSections)
    .set({ content, updatedAt: new Date() })
    .where(eq(pageSections.id, section.id));
}

/**
 * Converts legacy About Us team items (name, role, description) into team-member
 * references. The Team dashboard becomes the single source of truth for cards.
 */
export async function syncAboutTeamMembers(): Promise<void> {
  const aboutPage = await db.query.pages.findFirst({
    where: eq(pages.path, "/about"),
    columns: { id: true },
  });
  if (!aboutPage) return;

  const section = await db.query.pageSections.findFirst({
    where: and(
      eq(pageSections.pageId, aboutPage.id),
      eq(pageSections.key, "team"),
    ),
  });
  if (!section) return;

  const currentItems = section.content.items ?? [];
  if (currentItems.length === 0) return;

  const members = await listTeamMembers();
  const seenIds = new Set<string>();
  const nextItems: NonNullable<PageSectionContent["items"]> = [];
  let changed = false;

  for (const item of currentItems) {
    let member = item.memberId
      ? members.find((candidate) => candidate.id === item.memberId)
      : undefined;

    if (!member && item.title?.trim()) {
      const name = item.title.trim();
      member = members.find(
        (candidate) => candidate.name.toLowerCase() === name.toLowerCase(),
      );

      if (!member) {
        member = await createTeamMember({
          name,
          role: item.meta?.trim() || null,
          bio: item.description?.trim() || null,
          imageUrl: null,
          technologies: [],
        });
        members.push(member);
      }
    }

    if (!member || seenIds.has(member.id)) {
      changed = true;
      continue;
    }

    seenIds.add(member.id);
    nextItems.push({ memberId: member.id });

    if (
      item.memberId !== member.id ||
      item.title !== undefined ||
      item.description !== undefined ||
      item.meta !== undefined ||
      item.href !== undefined
    ) {
      changed = true;
    }
  }

  if (!changed) return;

  const content: PageSectionContent = {
    ...section.content,
    items: nextItems,
  };

  await db
    .update(pageSections)
    .set({ content, updatedAt: new Date() })
    .where(eq(pageSections.id, section.id));
}
