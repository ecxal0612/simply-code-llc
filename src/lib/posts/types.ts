/** Shared blog post helpers (safe to import from client and server code). */

export type PostStatus = "draft" | "published";

export const MAX_POST_CATEGORIES = 10;
export const MAX_POST_CATEGORY_LENGTH = 60;

export function slugifyPostTitle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Trims, deduplicates, and limits categories while preserving their display casing. */
export function normalizePostCategories(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const category = value
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, MAX_POST_CATEGORY_LENGTH);
    if (!category) continue;

    const key = category.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(category);
    if (result.length >= MAX_POST_CATEGORIES) break;
  }

  return result;
}

/** Splits comma-separated input so users can paste several categories at once. */
export function parseCategoryInput(value: string): string[] {
  return normalizePostCategories(value.split(","));
}

/** Creates a plain-text excerpt from the post's rich HTML. */
export function postExcerpt(
  body: string | null | undefined,
  maxLength = 180,
): string {
  const text = (body ?? "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

const READING_WORDS_PER_MINUTE = 220;

function htmlToPlainText(html: string | null | undefined): string {
  return (html ?? "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Estimated reading time from post HTML (minimum 1 minute). */
export function estimateReadingTimeMinutes(
  body: string | null | undefined,
): number {
  const words = htmlToPlainText(body).split(" ").filter(Boolean).length;
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / READING_WORDS_PER_MINUTE));
}

export function formatReadingTime(body: string | null | undefined): string {
  const minutes = estimateReadingTimeMinutes(body);
  return `${minutes} min read`;
}
