import { CobaltSiteFooter } from "~/components/home/cobalt-site-footer";
import { homeCopy } from "~/lib/home/content";
import { getSiteLogoUrl } from "~/server/site-header";

export async function SiteFooter() {
  const logoUrl = await getSiteLogoUrl();

  return <CobaltSiteFooter brand={homeCopy.brand} logoUrl={logoUrl} />;
}
