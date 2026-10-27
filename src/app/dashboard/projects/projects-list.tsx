"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { DeleteProjectButton } from "~/app/dashboard/projects/delete-project-button";
import { DashboardListSearch } from "~/components/dashboard/dashboard-list-search";
import { Button } from "~/components/ui/button";
import { matchesListSearch, normalizeSearchQuery } from "~/lib/dashboard/list-search";
import type { ProjectRecord } from "~/server/projects";

export function ProjectsList({
  projects,
  isAdmin,
}: {
  projects: ProjectRecord[];
  isAdmin: boolean;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearchQuery(query);

  const visibleProjects = useMemo(() => {
    if (!normalizedQuery) return projects;

    return projects.filter((project) =>
      matchesListSearch(normalizedQuery, [
        project.title,
        project.label,
        project.projectDate,
        project.description,
        ...project.links.map((link) => link.label),
        ...project.links.map((link) => link.url),
      ]),
    );
  }, [projects, normalizedQuery]);

  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <p className="font-medium">All projects</p>
        <p className="text-muted-foreground text-xs">
          {normalizedQuery
            ? `${visibleProjects.length} result${visibleProjects.length === 1 ? "" : "s"}`
            : `${projects.length} total`}
        </p>
      </div>
      <DashboardListSearch
        value={query}
        onChange={setQuery}
        placeholder="Search projects by title, label, date, or description…"
      />
      {projects.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-medium">No projects yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Create a project, then select it in the Homepage or Our Work page
            editor.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 size-4" />
              Create new project
            </Link>
          </Button>
        </div>
      ) : visibleProjects.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-medium">No matching projects</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Try a different title, label, or description.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {visibleProjects.map((project) => (
            <div
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-md border">
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{project.title}</p>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    {[project.label, project.projectDate]
                      .filter(Boolean)
                      .join(" · ") || "No label or date"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm">
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Pencil className="mr-1.5 size-3.5" />
                    Edit
                  </Link>
                </Button>
                {isAdmin ? (
                  <DeleteProjectButton
                    projectId={project.id}
                    title={project.title}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
