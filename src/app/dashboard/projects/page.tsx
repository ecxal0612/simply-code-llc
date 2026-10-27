import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { DeleteProjectButton } from "~/app/dashboard/projects/delete-project-button";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import { listProjects } from "~/server/projects";

export default async function DashboardProjectsPage() {
  const session = await auth();
  const isAdmin = isAdminRole(session?.user.role);
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Portfolio projects used in Homepage and Our Work sections. No public
            project detail pages.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 size-4" />
            Create new project
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <p className="font-medium">All projects</p>
          <p className="text-muted-foreground text-xs">{projects.length} total</p>
        </div>
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
        ) : (
          <div className="divide-y">
            {projects.map((project) => (
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
    </div>
  );
}
