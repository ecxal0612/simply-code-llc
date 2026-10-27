"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "~/lib/utils";

export function MessagesInboxTabs({
  inboxCount,
  archivedCount,
}: {
  inboxCount: number;
  archivedCount: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "archived" ? "archived" : "inbox";

  function hrefFor(nextView: "inbox" | "archived") {
    if (nextView === "inbox") return pathname;
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "archived");
    return `${pathname}?${params.toString()}`;
  }

  const tabs = [
    { id: "inbox" as const, label: "Inbox", count: inboxCount },
    { id: "archived" as const, label: "Archived", count: archivedCount },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = view === tab.id;
        return (
          <Link
            key={tab.id}
            href={hrefFor(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px]",
                active ? "bg-primary/15" : "bg-muted",
              )}
            >
              {tab.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
