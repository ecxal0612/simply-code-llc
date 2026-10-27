export const DEFAULT_BLOG_PAGE_SIZE = 6;

export const BLOG_PER_PAGE_OPTIONS = [6, 9, 12, 24] as const;

export type BlogPerPageOption = (typeof BLOG_PER_PAGE_OPTIONS)[number];

export function parseBlogPageSize(
  value: string | string[] | undefined,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);
  if (
    BLOG_PER_PAGE_OPTIONS.includes(parsed as BlogPerPageOption)
  ) {
    return parsed;
  }
  return DEFAULT_BLOG_PAGE_SIZE;
}

export function blogListingHref(
  page: number,
  pageSize: number = DEFAULT_BLOG_PAGE_SIZE,
): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (pageSize !== DEFAULT_BLOG_PAGE_SIZE) {
    params.set("perPage", String(pageSize));
  }
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}
