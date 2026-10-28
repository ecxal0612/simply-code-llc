import { SiteFooter } from "~/components/site/site-footer";
import { SiteHeader } from "~/components/site/site-header";
import { auth } from "~/lib/auth";
import { getSiteLogoUrl } from "~/server/site-header";

export async function SiteLayout({
  children,
  homeNavigationEffects,
}: {
  children: React.ReactNode;
  /** Home-only scroll / anchor helpers rendered above the header. */
  homeNavigationEffects?: React.ReactNode;
}) {
  const session = await auth();
  const logoUrl = await getSiteLogoUrl();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />
      {homeNavigationEffects}
      <SiteHeader isLoggedIn={!!session?.user} logoUrl={logoUrl} />
      <main>{children}</main>
      <SiteFooter logoUrl={logoUrl} />
    </div>
  );
}
