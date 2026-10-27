import type { PageSectionItem } from "~/lib/pages/types";
import type { ProjectLink } from "~/server/db/schema";

export type ProjectSource = {
  id: string;
  title: string;
  description: string | null;
  label: string | null;
  projectDate: string | null;
  imageUrl: string | null;
  links: ProjectLink[];
};

export type ResolvedProjectCard = {
  key: string;
  title: string;
  description: string;
  meta: string;
  href: string;
  linkLabel: string;
  imageUrl: string | null;
};

function buildMeta(label: string | null, projectDate: string | null): string {
  const parts = [label?.trim(), projectDate?.trim()].filter(Boolean);
  return parts.join(" · ") || "Project";
}

export function resolveProjectSectionItem(
  item: PageSectionItem,
  index: number,
  projectsById: Map<string, ProjectSource>,
): ResolvedProjectCard | null {
  if (item.projectId) {
    const project = projectsById.get(item.projectId);
    if (!project) return null;
    const primaryLink = project.links[0];
    return {
      key: project.id,
      title: project.title,
      description: project.description ?? "",
      meta: buildMeta(project.label, project.projectDate),
      href: primaryLink?.url ?? "/contact",
      linkLabel: primaryLink?.label ?? "View Project",
      imageUrl: project.imageUrl,
    };
  }

  if (!item.title?.trim()) return null;
  return {
    key: `legacy-${index}`,
    title: item.title,
    description: item.description ?? "",
    meta: item.meta?.trim() || "Project",
    href: item.href ?? "/contact",
    linkLabel: "View Project",
    imageUrl: null,
  };
}

export function collectProjectIdsFromItems(
  items: PageSectionItem[] | undefined,
): string[] {
  if (!items?.length) return [];
  return items
    .map((item) => item.projectId)
    .filter((id): id is string => Boolean(id));
}
