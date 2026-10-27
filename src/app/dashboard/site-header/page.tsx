import Link from "next/link";
import { ExternalLink, Home } from "lucide-react";
import { SiteHeaderSettings } from "~/app/dashboard/site-header/site-header-settings";
import { Button } from "~/components/ui/button";
import { listPages } from "~/server/pages";
import {
  getSiteLogoUrl,
  getStoredHeaderNavPaths,
} from "~/server/site-header";

export default async function DashboardSiteHeaderPage() {
  const [pages, headerNavPaths, logoUrl] = await Promise.all([
    listPages(),
    getStoredHeaderNavPaths(),
    getSiteLogoUrl(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Site header</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Customize the public navigation and logo shown on every marketing
            page.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/" target="_blank" rel="noreferrer">
            <Home className="mr-2 size-4" />
            View homepage
            <ExternalLink className="ml-2 size-3.5 opacity-60" />
          </Link>
        </Button>
      </div>
      <SiteHeaderSettings
        pages={pages.map((page) => ({
          id: page.id,
          title: page.title,
          path: page.path,
          status: page.status,
        }))}
        initialNavPaths={headerNavPaths}
        logoUrl={logoUrl}
      />
    </div>
  );
}
