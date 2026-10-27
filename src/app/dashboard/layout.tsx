import Link from "next/link";
import { ExternalLink, Home, Menu } from "lucide-react";
import {
  DashboardSidebarNav,
  type DashboardNavIconKey,
  type DashboardNavSection,
} from "~/app/dashboard/dashboard-sidebar-nav";
import { SignOutButton } from "~/components/sign-out-button";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import { Button } from "~/components/ui/button";

export const dynamic = "force-dynamic";

type NavItemConfig = {
  href: string;
  label: string;
  icon: DashboardNavIconKey;
  adminOnly?: boolean;
};

const navSections: { title: string; items: NavItemConfig[] }[] = [
  {
    title: "Main",
    items: [
      { href: "/dashboard", label: "Overview", icon: "layoutDashboard" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/dashboard/pages", label: "Pages", icon: "fileText" },
      { href: "/dashboard/posts", label: "Posts", icon: "bookOpen" },
      { href: "/dashboard/team", label: "Team", icon: "users" },
      { href: "/dashboard/projects", label: "Projects", icon: "folderKanban" },
      {
        href: "/dashboard/site-header",
        label: "Site header",
        icon: "panelTop",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        href: "/dashboard/messages",
        label: "Messages",
        icon: "messageSquare",
        adminOnly: true,
      },
      {
        href: "/dashboard/users",
        label: "Users",
        icon: "userCog",
        adminOnly: true,
      },
    ],
  },
  {
    title: "Account",
    items: [{ href: "/dashboard/profile", label: "Profile", icon: "user" }],
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = isAdminRole(session?.user.role);
  const visibleSections: DashboardNavSection[] = navSections
    .map((section) => ({
      title: section.title,
      items: section.items
        .filter((item) => !item.adminOnly || isAdmin)
        .map(({ href, label, icon }) => ({ href, label, icon })),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="bg-background min-h-screen">
      <div className="flex">
        <aside className="bg-card sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r max-lg:hidden">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md font-mono text-xs font-bold">
                SC
              </span>
              <span className="text-sm font-semibold">Simply Code LLC</span>
            </Link>
          </div>
          <DashboardSidebarNav sections={visibleSections} />
          <div className="space-y-3 border-t p-4">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/" target="_blank" rel="noreferrer">
                <Home className="mr-2 size-4" />
                View homepage
                <ExternalLink className="ml-auto size-3.5 opacity-60" />
              </Link>
            </Button>
            <p className="text-muted-foreground text-xs">
              Signed in as {session?.user.email}
            </p>
          </div>
        </aside>
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="size-4" />
              </Button>
              <p className="text-sm font-medium">Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <SignOutButton />
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
