"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AuthNavLink } from "~/components/home/auth-nav-link";
import { Button } from "~/components/ui/button";
import { cobaltClass } from "~/lib/home/cobalt-theme";
import { cn } from "~/lib/utils";

export function HomeMobileNav({
  brand,
  nav,
  isLoggedIn,
}: {
  brand: string;
  nav: readonly { id: string; label: string }[];
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="rounded-lg p-2 text-zinc-200"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open ? (
        <div
          className={cn(
            "absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-white/10 bg-zinc-950/95 px-6 py-4 shadow-lg backdrop-blur-xl",
          )}
        >
          <p className="mb-3 text-sm font-semibold text-zinc-50">{brand}</p>
          <ul className="flex flex-col gap-3">
            {nav.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.id.startsWith("/") ? item.id : `#${item.id}`}
                  className={cn("text-sm font-medium text-zinc-400", cobaltClass.linkHover)}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-5">
            {isLoggedIn ? (
              <Button asChild size="sm" className={cn("rounded-none", cobaltClass.btn)}>
                <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" className={cn("rounded-none", cobaltClass.btn)}>
                  <AuthNavLink href="/login" onClick={() => setOpen(false)}>Sign In</AuthNavLink>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-none border-[#4682B4]/60 bg-transparent text-zinc-100 hover:border-[#1E90FF] hover:bg-white/5"
                >
                  <AuthNavLink href="/register" onClick={() => setOpen(false)}>Create Account</AuthNavLink>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
