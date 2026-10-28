import { CobaltSiteFooter } from "~/components/home/cobalt-site-footer";
import { homeCopy } from "~/lib/home/content";

export function SiteFooter({ logoUrl }: { logoUrl: string | null }) {
  return <CobaltSiteFooter brand={homeCopy.brand} logoUrl={logoUrl} />;
}
