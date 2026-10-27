"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Eye, Pencil } from "lucide-react";
import { DeletePageButton } from "~/app/dashboard/pages/delete-page-button";
import { DashboardListSearch } from "~/components/dashboard/dashboard-list-search";
import { Button } from "~/components/ui/button";
import { matchesListSearch, normalizeSearchQuery } from "~/lib/dashboard/list-search";
import type { PageWithCreator } from "~/server/pages";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function PagesList({
  pages,
  isAdmin,
}: {
  pages: PageWithCreator[];
  isAdmin: boolean;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearchQuery(query);

  const visiblePages = useMemo(() => {
    if (!normalizedQuery) return pages;

    return pages.filter((page) =>
      matchesListSearch(normalizedQuery, [
        page.title,
        page.slug,
        page.path,
        page.isSystem ? "Built-in" : "Custom",
        page.creatorName,
        page.creatorEmail,
      ]),
    );
  }, [pages, normalizedQuery]);

  const customCount = pages.filter((page) => !page.isSystem).length;

  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <p className="font-medium">All pages</p>
        <p className="text-muted-foreground text-xs">
          {normalizedQuery
            ? `${visiblePages.length} result${visiblePages.length === 1 ? "" : "s"}`
            : `${pages.length} total · ${customCount} custom`}
        </p>
      </div>
      <DashboardListSearch
        value={query}
        onChange={setQuery}
        placeholder="Search pages by title, path, type, or author…"
      />
      {visiblePages.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-medium">
            {normalizedQuery ? "No matching pages" : "No pages yet"}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {normalizedQuery
              ? "Try a different title, path, or author name."
              : "Create a custom page to get started."}
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {visiblePages.map((page) => (
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
                  Updated {dateFormatter.format(new Date(page.updatedAt))}
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
      )}
    </div>
  );
}
