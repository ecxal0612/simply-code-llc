import Link from "next/link";
import { Plus } from "lucide-react";
import { PagesList } from "~/app/dashboard/pages/pages-list";
import { Button } from "~/components/ui/button";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import { listPagesWithCreators } from "~/server/pages";

export default async function DashboardPagesPage() {
  const session = await auth();
  const isAdmin = isAdminRole(session?.user.role);
  const pages = await listPagesWithCreators();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Pages</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Pages stored in the database. Edit the content of each section or
            create a new page.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/pages/new">
            <Plus className="mr-2 size-4" />
            Create new page
          </Link>
        </Button>
      </div>

      <PagesList pages={pages} isAdmin={isAdmin} />
    </div>
  );
}
