import {
  DashboardShell,
} from "~/app/dashboard/dashboard-shell";
import {
  type DashboardNavIconKey,
  type DashboardNavSection,
} from "~/app/dashboard/dashboard-sidebar-nav";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import { homeCopy } from "~/lib/home/content";
import { getSiteLogoUrl } from "~/server/site-header";
import "~/styles/dashboard.css";

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
  const logoUrl = await getSiteLogoUrl();
  const visibleSections: DashboardNavSection[] = navSections
    .map((section) => ({
      title: section.title,
      items: section.items
        .filter((item) => !item.adminOnly || isAdmin)
        .map(({ href, label, icon }) => ({ href, label, icon })),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <DashboardShell
      sections={visibleSections}
      userEmail={session?.user.email}
      logoUrl={logoUrl}
      brand={homeCopy.brand}
    >
      {children}
    </DashboardShell>
  );
}
