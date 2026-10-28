"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DashboardSidebarNav, type DashboardNavSection } from "~/app/dashboard/dashboard-sidebar-nav";
import { SiteBrandLogo } from "~/components/site/site-brand-logo";
import { Button } from "~/components/ui/button";

export function DashboardSidebarPanel({
  sections,
  userEmail,
  logoUrl,
  brand,
  onNavigate,
}: {
  sections: DashboardNavSection[];
  userEmail?: string | null;
  logoUrl: string | null;
  brand: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="dashboard-sidebar-brand flex h-16 shrink-0 items-center border-b px-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={() => onNavigate?.()}
        >
          <SiteBrandLogo
            brand={brand}
            logoUrl={logoUrl}
            variant="dashboard"
            wordmarkClassName="text-white"
            className="text-white"
          />
        </Link>
      </div>
      <DashboardSidebarNav sections={sections} onNavigate={onNavigate} />
      <div className="dashboard-sidebar-footer mt-auto space-y-3 border-t p-4">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          <Link href="/" target="_blank" rel="noreferrer">
            View homepage
            <ExternalLink className="ml-auto size-3.5 opacity-60" />
          </Link>
        </Button>
        <p className="dashboard-sidebar-muted text-xs">
          Signed in as {userEmail}
        </p>
      </div>
    </div>
  );
}
