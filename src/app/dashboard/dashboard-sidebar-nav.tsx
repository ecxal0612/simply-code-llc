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
  onNavigate?: () => void;
};

export function DashboardSidebarNav({
  sections,
  onNavigate,
}: DashboardSidebarNavProps) {
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
    <nav className="flex flex-1 flex-col space-y-6 p-3 sm:p-4">
      {sections.map((section) => (
        <div key={section.title} className="space-y-1">
          <p className="px-3 text-[10px] font-semibold tracking-[0.2em] text-white/40 uppercase">
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
                onClick={() => onNavigate?.()}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-[#1e90ff]/15 font-medium text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                {isActive ? (
                  <span
                    className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#1e90ff]"
                    aria-hidden
                  />
                ) : null}
                <Icon className="size-[18px] shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {showBadge ? (
                  <span
                    className="size-2 shrink-0 rounded-full bg-[#1e90ff]"
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
