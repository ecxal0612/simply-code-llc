import Link from "next/link";
import { AuthNavLink } from "~/components/home/auth-nav-link";
import { HomeMobileNav } from "~/components/home/home-mobile-nav";
import { SiteBrandLogo } from "~/components/site/site-brand-logo";
import { Button } from "~/components/ui/button";
import type { SiteNavItem } from "~/lib/site/header";
import { cobaltClass } from "~/lib/home/cobalt-theme";
import { cn } from "~/lib/utils";

export function CobaltSiteHeader({
  isLoggedIn,
  brand,
  nav,
  logoUrl,
}: {
  isLoggedIn: boolean;
  brand: string;
  nav: SiteNavItem[];
  logoUrl: string | null;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/75">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <SiteBrandLogo brand={brand} logoUrl={logoUrl} />
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-xs font-medium uppercase tracking-widest text-zinc-400 transition",
                cobaltClass.linkHover,
              )}
            >
              {item.label}
            </Link>
          ))}
          <span className="h-4 w-px bg-white/15" aria-hidden />
          {isLoggedIn ? (
            <Button
              asChild
              size="sm"
              className={cn("h-8 rounded-[10px] px-4 text-xs", cobaltClass.btn)}
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                variant="ghost"
                className={cn(
                  "h-8 rounded-[10px] px-3 text-xs text-zinc-300",
                  cobaltClass.btnGhostHover,
                )}
              >
                <AuthNavLink href="/login">Sign In</AuthNavLink>
              </Button>
              <Button
                asChild
                size="sm"
                className={cn(
                  "h-8 rounded-[10px] border border-[#4682B4]/60 bg-transparent px-3 text-xs text-zinc-100 hover:border-[#1E90FF] hover:bg-white/5",
                )}
              >
                <AuthNavLink href="/register">Create Account</AuthNavLink>
              </Button>
            </div>
          )}
        </nav>

        <HomeMobileNav
          brand={brand}
          nav={nav.map((item) => ({ id: item.href, label: item.label }))}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </header>
  );
}
