"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

function scrollToHashTarget() {
  const id = window.location.hash.replace(/^#/, "");
  if (!id) return;
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Keeps `/` showing the homepage after browser back from auth routes (hash URLs included). */
export function HomeNavigationEffects() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/") return;

    const handlePopState = () => {
      router.refresh();
      requestAnimationFrame(scrollToHashTarget);
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        router.refresh();
      }
      requestAnimationFrame(scrollToHashTarget);
    };

    requestAnimationFrame(scrollToHashTarget);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [pathname, router]);

  return null;
}
