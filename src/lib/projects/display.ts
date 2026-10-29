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

export type ResolvedProjectLink = {
  label: string;
  href: string;
};

export type ResolvedProjectCard = {
  key: string;
  title: string;
  description: string;
  meta: string;
  links: ResolvedProjectLink[];
  imageUrl: string | null;
};

function buildMeta(label: string | null, projectDate: string | null): string {
  const parts = [label?.trim(), projectDate?.trim()].filter(Boolean);
  return parts.join(" · ") || "Project";
}

function resolveProjectLinks(links: ProjectLink[]): ResolvedProjectLink[] {
  const normalized = links
    .map((link) => ({
      label: link.label.trim(),
      href: link.url.trim(),
    }))
    .filter((link) => link.label && link.href);

  if (normalized.length > 0) return normalized;

  return [{ label: "View Project", href: "/contact" }];
}

export function resolveProjectSectionItem(
  item: PageSectionItem,
  index: number,
  projectsById: Map<string, ProjectSource>,
): ResolvedProjectCard | null {
  if (item.projectId) {
    const project = projectsById.get(item.projectId);
    if (!project) return null;
    return {
      key: project.id,
      title: project.title,
      description: project.description ?? "",
      meta: buildMeta(project.label, project.projectDate),
      links: resolveProjectLinks(project.links),
      imageUrl: project.imageUrl,
    };
  }

  if (!item.title?.trim()) return null;
  return {
    key: `legacy-${index}`,
    title: item.title,
    description: item.description ?? "",
    meta: item.meta?.trim() || "Project",
    links: resolveProjectLinks(
      item.href?.trim()
        ? [{ label: "View Project", url: item.href }]
        : [],
    ),
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
