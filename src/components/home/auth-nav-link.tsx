"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/** Avoid stale App Router state when returning from auth with a hash in the URL. */
function normalizeHomeUrlBeforeAuthNav() {
  if (window.location.pathname === "/" && window.location.hash) {
    window.history.replaceState(null, "", "/");
  }
}

export function AuthNavLink({ href, onClick, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        normalizeHomeUrlBeforeAuthNav();
        onClick?.(event);
      }}
      {...props}
    />
  );
}
