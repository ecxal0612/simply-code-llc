import { CobaltSiteHeader } from "~/components/home/cobalt-site-header";
import { homeCopy } from "~/lib/home/content";
import { getSiteLogoUrl, resolveHeaderNavItems } from "~/server/site-header";

export async function SiteHeader({
  isLoggedIn,
  logoUrl: logoUrlProp,
}: {
  isLoggedIn: boolean;
  logoUrl?: string | null;
}) {
  const [nav, logoUrl] = await Promise.all([
    resolveHeaderNavItems(),
    logoUrlProp !== undefined ? Promise.resolve(logoUrlProp) : getSiteLogoUrl(),
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
