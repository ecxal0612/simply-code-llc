"use client";

import { useRouter } from "next/navigation";
import { BLOG_PER_PAGE_OPTIONS, blogListingHref } from "~/lib/posts/pagination";

export function BlogPerPageSelect({ currentPageSize }: { currentPageSize: number }) {
  const router = useRouter();

  function handleChange(nextSize: number) {
    if (nextSize === currentPageSize) return;
    const href = blogListingHref(1, nextSize);
    router.push(href);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-400">
      <span className="whitespace-nowrap">Posts per page</span>
      <select
        value={currentPageSize}
        onChange={(event) =>
          handleChange(Number.parseInt(event.target.value, 10))
        }
        className="border-input h-9 min-w-[4.5rem] rounded-none border bg-zinc-900 px-2 text-sm text-zinc-100"
        aria-label="Posts per page"
      >
        {BLOG_PER_PAGE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
  );
}
