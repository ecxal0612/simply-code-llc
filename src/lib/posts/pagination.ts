export const DEFAULT_BLOG_PAGE_SIZE = 6;

export const BLOG_PER_PAGE_OPTIONS = [6, 9, 12] as const;

export type BlogPerPageOption = (typeof BLOG_PER_PAGE_OPTIONS)[number];

export function resolveBlogPostsPerPage(
  value: number | undefined | null,
): BlogPerPageOption {
  if (
    value !== undefined &&
    value !== null &&
    BLOG_PER_PAGE_OPTIONS.includes(value as BlogPerPageOption)
  ) {
    return value as BlogPerPageOption;
  }
  return DEFAULT_BLOG_PAGE_SIZE;
}

export function blogListingHref(page: number): string {
  if (page <= 1) return "/blog";
  return `/blog?page=${page}`;
}
