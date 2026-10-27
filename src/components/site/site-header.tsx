import { CobaltSiteHeader } from "~/components/home/cobalt-site-header";
import { homeCopy } from "~/lib/home/content";
import { getSiteLogoUrl, resolveHeaderNavItems } from "~/server/site-header";

export async function SiteHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [nav, logoUrl] = await Promise.all([
    resolveHeaderNavItems(),
    getSiteLogoUrl(),
  ]);

  return (
    <CobaltSiteHeader
      isLoggedIn={isLoggedIn}
      brand={homeCopy.brand}
      nav={nav}
      logoUrl={logoUrl}
    />
  );
}
