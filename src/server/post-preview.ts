import "server-only";

import { auth } from "~/lib/auth";
import { getPostBySlug, type PostRecord } from "~/server/posts";

export type PostSearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>
  | undefined;

function isPreviewRequest(params: Awaited<PostSearchParams>): boolean {
  if (!params) return false;
  const preview = params.preview;
  if (Array.isArray(preview)) {
    return preview.some((value) => value === "1" || value === "true");
  }
  return preview === "1" || preview === "true";
}

/**
 * Loads a blog post for a public route. Drafts stay hidden unless the request
 * includes `?preview=1` and belongs to an authenticated dashboard session.
 */
export async function getPostForViewer(
  slug: string,
  searchParams?: PostSearchParams,
): Promise<PostRecord | null> {
  const params = await searchParams;
  if (!isPreviewRequest(params)) {
    return getPostBySlug(slug);
  }

  const session = await auth();
  if (!session?.user?.id) {
    return getPostBySlug(slug);
  }

  return getPostBySlug(slug, { includeDrafts: true });
}
