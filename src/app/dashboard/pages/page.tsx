import Link from "next/link";
import { ExternalLink, Eye, Pencil, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DeletePageButton } from "~/app/dashboard/pages/delete-page-button";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import { listPagesWithCreators } from "~/server/pages";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

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

      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <p className="font-medium">All pages</p>
          <p className="text-muted-foreground text-xs">{pages.length} total</p>
        </div>
        <div className="divide-y">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{page.title}</p>
                  <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium">
                    {page.isSystem ? "Built-in" : "Custom"}
                  </span>
                  <span
                    className={
                      page.status === "published"
                        ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600"
                        : "rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600"
                    }
                  >
                    {page.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  {page.path}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {page.isSystem ? (
                    <>Built-in page</>
                  ) : (
                    <>
                      By{" "}
                      {page.creatorName?.trim() ||
                        page.creatorEmail ||
                        "Unknown author"}
                    </>
                  )}
                  {" · "}
                  Updated {dateFormatter.format(page.updatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {page.status === "draft" ? (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`${page.path}?preview=1`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Eye className="mr-1.5 size-3.5" />
                      Preview Page
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href={page.path} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1.5 size-3.5" />
                      View
                    </Link>
                  </Button>
                )}
                <Button asChild size="sm">
                  <Link href={`/dashboard/pages/${page.id}`}>
                    <Pencil className="mr-1.5 size-3.5" />
                    Edit
                  </Link>
                </Button>
                {isAdmin ? (
                  <DeletePageButton
                    pageId={page.id}
                    title={page.title}
                    isSystem={page.isSystem}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
