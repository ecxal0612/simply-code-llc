"use client";

import { Label } from "~/components/ui/label";
import { BLOG_PER_PAGE_OPTIONS } from "~/lib/posts/pagination";

export function BlogPostsSectionSettings({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (postsPerPage: number) => void;
}) {
  const selected = value ?? 6;

  return (
    <div className="space-y-2 rounded-md border p-4">
      <Label htmlFor="blog-posts-per-page">Posts per page</Label>
      <p className="text-muted-foreground text-xs">
        Controls how many published posts appear on each page of the public blog
        listing.
      </p>
      <select
        id="blog-posts-per-page"
        value={selected}
        onChange={(event) =>
          onChange(Number.parseInt(event.target.value, 10))
        }
        className="border-input bg-background h-9 w-full max-w-xs rounded-md border px-3 text-sm"
      >
        {BLOG_PER_PAGE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size} posts per page
          </option>
        ))}
      </select>
    </div>
  );
}
