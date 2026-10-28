"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { DashboardSidebarPanel } from "~/app/dashboard/dashboard-sidebar-panel";
import type { DashboardNavSection } from "~/app/dashboard/dashboard-sidebar-nav";
import { SignOutButton } from "~/components/sign-out-button";
import { Button } from "~/components/ui/button";

const sectionTitles: { prefix: string; title: string }[] = [
  { prefix: "/dashboard/pages", title: "Pages" },
  { prefix: "/dashboard/posts", title: "Posts" },
  { prefix: "/dashboard/team", title: "Team" },
  { prefix: "/dashboard/projects", title: "Projects" },
  { prefix: "/dashboard/site-header", title: "Site header" },
  { prefix: "/dashboard/messages", title: "Messages" },
  { prefix: "/dashboard/users", title: "Users" },
  { prefix: "/dashboard/profile", title: "Profile" },
  { prefix: "/dashboard/admin", title: "Admin" },
  { prefix: "/dashboard", title: "Overview" },
];

function resolveSectionTitle(pathname: string): string {
  const match = sectionTitles.find(
    (entry) =>
      entry.prefix === pathname ||
      (entry.prefix !== "/dashboard" &&
        pathname.startsWith(`${entry.prefix}/`)),
  );
  return match?.title ?? "Dashboard";
}

export function DashboardShell({
  children,
  sections,
  userEmail,
  logoUrl,
  brand,
}: {
  children: React.ReactNode;
  sections: DashboardNavSection[];
  userEmail?: string | null;
  logoUrl: string | null;
  brand: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sectionTitle = resolveSectionTitle(pathname);
  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const sidebarPanel = (
    <DashboardSidebarPanel
      sections={sections}
      userEmail={userEmail}
      logoUrl={logoUrl}
      brand={brand}
      onNavigate={closeMobile}
    />
  );

  return (
    <div className="dashboard-shell min-h-screen">
      <div className="flex min-h-screen">
        <aside className="dashboard-sidebar sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r lg:block">
          {sidebarPanel}
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
            <button
              type="button"
              className="dashboard-overlay absolute inset-0"
              aria-label="Close menu"
              onClick={closeMobile}
            />
            <aside className="dashboard-mobile-drawer relative h-full w-[min(100%,18rem)] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="text-sm font-semibold text-white">Menu</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={closeMobile}
                >
                  <X className="size-5" />
                </Button>
              </div>
              {sidebarPanel}
            </aside>
          </div>
        ) : null}

        <div className="dashboard-main flex min-w-0 flex-1 flex-col">
          <header className="dashboard-top-header sticky top-0 z-40 flex flex-wrap items-center gap-3 border-b px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 lg:hidden"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <div className="min-w-0">
                <p className="text-muted-foreground hidden text-xs sm:block">
                  Simply Code LLC
                </p>
                <p className="truncate text-base font-semibold text-zinc-900">
                  {sectionTitle}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {userEmail ? (
                <span className="text-muted-foreground hidden max-w-[10rem] truncate text-xs md:inline">
                  {userEmail}
                </span>
              ) : null}
              <SignOutButton className="dashboard-sign-out h-9 rounded-[10px] px-4 text-sm" />
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
