import "server-only";

import { auth } from "~/lib/auth";
import { getPageByPath, type PageWithSections } from "~/server/pages";

export type PageSearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>
  | undefined;

function isPreviewRequest(params: Awaited<PageSearchParams>): boolean {
  if (!params) return false;
  const preview = params.preview;
  if (Array.isArray(preview)) {
    return preview.some((value) => value === "1" || value === "true");
  }
  return preview === "1" || preview === "true";
}

/**
 * Loads a page for a public route. Drafts stay hidden unless the request includes
 * `?preview=1` and belongs to an authenticated dashboard session.
 */
export async function getPageForViewer(
  path: string,
  searchParams?: PageSearchParams,
): Promise<PageWithSections | null> {
  const params = await searchParams;
  if (!isPreviewRequest(params)) {
    return getPageByPath(path);
  }

  const session = await auth();
  if (!session?.user?.id) {
    return getPageByPath(path);
  }

  return getPageByPath(path, { includeDrafts: true });
}
