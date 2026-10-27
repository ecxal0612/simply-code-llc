import Link from "next/link";
import { Plus } from "lucide-react";
import { ProjectsList } from "~/app/dashboard/projects/projects-list";
import { Button } from "~/components/ui/button";
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

      <ProjectsList projects={projects} isAdmin={isAdmin} />
    </div>
  );
}
