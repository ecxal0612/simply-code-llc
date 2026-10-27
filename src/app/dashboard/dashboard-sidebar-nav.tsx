"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  PanelTop,
  User,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  acknowledgeMessageIds,
  readAcknowledgedMessageIds,
} from "~/lib/dashboard/messages-badge-storage";
import { cn } from "~/lib/utils";

export const dashboardNavIconMap = {
  layoutDashboard: LayoutDashboard,
  fileText: FileText,
  bookOpen: BookOpen,
  users: Users,
  folderKanban: FolderKanban,
  panelTop: PanelTop,
  messageSquare: MessageSquare,
  userCog: UserCog,
  user: User,
} as const;

export type DashboardNavIconKey = keyof typeof dashboardNavIconMap;

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: DashboardNavIconKey;
};

export type DashboardNavSection = {
  title: string;
  items: DashboardNavItem[];
};

type DashboardSidebarNavProps = {
  sections: DashboardNavSection[];
};

export function DashboardSidebarNav({ sections }: DashboardSidebarNavProps) {
  const pathname = usePathname();
  const onMessagesRoute = pathname.startsWith("/dashboard/messages");
  const [unreadIds, setUnreadIds] = useState<string[]>([]);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(() =>
    readAcknowledgedMessageIds(),
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/contact-messages/unread-count");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { ids?: string[] };
        const ids = Array.isArray(data.ids) ? data.ids : [];
        if (cancelled) return;

        if (onMessagesRoute) {
          const merged = acknowledgeMessageIds(ids);
          setAcknowledgedIds(merged);
        }

        setUnreadIds(ids);
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, onMessagesRoute]);

  const pendingCount = unreadIds.filter((id) => !acknowledgedIds.has(id)).length;
  const showMessagesBadge = pendingCount > 0 && !onMessagesRoute;

  return (
    <nav className="flex-1 space-y-6 p-4">
      {sections.map((section) => (
        <div key={section.title} className="space-y-1">
          <p className="text-muted-foreground px-3 text-[11px] font-semibold uppercase tracking-wider">
            {section.title}
          </p>
          {section.items.map((item) => {
            const Icon: LucideIcon = dashboardNavIconMap[item.icon];
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));
            const showBadge =
              item.href === "/dashboard/messages" && showMessagesBadge;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {showBadge ? (
                  <span
                    className="bg-primary size-2 shrink-0 rounded-full"
                    aria-label={`${pendingCount} unread messages`}
                    title={`${pendingCount} unread message${pendingCount === 1 ? "" : "s"}`}
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
