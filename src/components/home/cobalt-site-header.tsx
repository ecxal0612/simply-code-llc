import Link from "next/link";
import { AuthNavLink } from "~/components/home/auth-nav-link";
import { HomeMobileNav } from "~/components/home/home-mobile-nav";
import { Button } from "~/components/ui/button";
import { homeCopy } from "~/lib/home/content";
import { cobaltClass } from "~/lib/home/cobalt-theme";
import { cn } from "~/lib/utils";

export function CobaltSiteHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const c = homeCopy;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/75">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-md font-mono text-xs font-bold",
              cobaltClass.logo,
            )}
          >
            SC
          </span>
          <span className="text-sm font-semibold tracking-tight">{c.brand}</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {c.nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "text-xs font-medium uppercase tracking-widest text-zinc-400 transition",
                cobaltClass.linkHover,
              )}
            >
              {item.label}
            </a>
          ))}
          <span className="h-4 w-px bg-white/15" aria-hidden />
          {isLoggedIn ? (
            <Button asChild size="sm" className={cn("h-8 rounded-none px-4 text-xs", cobaltClass.btn)}>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                variant="ghost"
                className={cn("h-8 rounded-none px-3 text-xs text-zinc-300", cobaltClass.btnGhostHover)}
              >
                <AuthNavLink href="/login">Sign in</AuthNavLink>
              </Button>
              <Button
                asChild
                size="sm"
                className={cn(
                  "h-8 rounded-none border border-[#4682B4]/60 bg-transparent px-3 text-xs text-zinc-100 hover:border-[#1E90FF] hover:bg-white/5",
                )}
              >
                <AuthNavLink href="/register">Create account</AuthNavLink>
              </Button>
            </div>
          )}
        </nav>

        <HomeMobileNav brand={c.brand} nav={c.nav} isLoggedIn={isLoggedIn} />
      </div>
    </header>
  );
}
