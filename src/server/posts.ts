import "server-only";

import { and, arrayOverlaps, count, desc, eq, ne } from "drizzle-orm";
import type { PostStatus } from "~/lib/posts/types";
import { slugifyPostTitle } from "~/lib/posts/types";
import { db } from "~/server/db";
import { images, posts, users } from "~/server/db/schema";
import { DEFAULT_BLOG_PAGE_SIZE } from "~/lib/posts/pagination";
import { deleteManagedUpload } from "~/server/uploadthing-cleanup";

export type PostRecord = typeof posts.$inferSelect;
export type ImageRecord = typeof images.$inferSelect;

/** @deprecated Use `DEFAULT_BLOG_PAGE_SIZE` from `~/lib/posts/pagination`. */
export const BLOG_PAGE_SIZE = DEFAULT_BLOG_PAGE_SIZE;

export type PaginatedPosts = {
  posts: PostRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function listPosts(): Promise<PostRecord[]> {
  return db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
  });
}

export type PostWithAuthor = PostRecord & {
  authorName: string | null;
  authorEmail: string | null;
  authorImage?: string | null;
};

export async function listPostsWithAuthors(): Promise<PostWithAuthor[]> {
  const rows = await db
    .select({
      post: posts,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt));

  return rows.map((row) => ({
    ...row.post,
    authorName: row.authorName,
    authorEmail: row.authorEmail,
  }));
}

export async function listPostCategories(): Promise<string[]> {
  const rows = await db.select({ categories: posts.categories }).from(posts);
  const categories = new Map<string, string>();

  for (const row of rows) {
    for (const category of row.categories) {
      const key = category.toLowerCase();
      if (!categories.has(key)) categories.set(key, category);
    }
  }

  return Array.from(categories.values()).sort((a, b) => a.localeCompare(b));
}

export async function getPostById(id: string): Promise<PostRecord | null> {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });
  return post ?? null;
}

export async function getPostBySlug(
  slug: string,
  { includeDrafts = false }: { includeDrafts?: boolean } = {},
): Promise<PostRecord | null> {
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
  });
  if (!post) return null;
  if (!includeDrafts && post.status !== "published") return null;
  return post;
}

export async function getPostWithAuthorBySlug(
  slug: string,
  { includeDrafts = false }: { includeDrafts?: boolean } = {},
): Promise<PostWithAuthor | null> {
  const rows = await db
    .select({
      post: posts,
      authorName: users.name,
      authorEmail: users.email,
      authorImage: users.image,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  if (!includeDrafts && row.post.status !== "published") return null;

  return {
    ...row.post,
    authorName: row.authorName,
    authorEmail: row.authorEmail,
    authorImage: row.authorImage,
  };
}

export async function listPublishedPosts({
  page = 1,
  pageSize = DEFAULT_BLOG_PAGE_SIZE,
}: {
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedPosts> {
  const safePageSize = Math.max(1, Math.trunc(pageSize));
  const [countRow] = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.status, "published"));
  const total = Number(countRow?.value ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, Math.trunc(page)), totalPages);

  const rows = await db.query.posts.findMany({
    where: eq(posts.status, "published"),
    orderBy: [desc(posts.createdAt)],
    limit: safePageSize,
    offset: (safePage - 1) * safePageSize,
  });

  return {
    posts: rows,
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
  };
}

/** Finds published posts that share at least one category with the current post. */
export async function getRelatedPosts(
  post: PostRecord,
  limit = 3,
): Promise<PostRecord[]> {
  if (post.categories.length === 0) return [];

  return db.query.posts.findMany({
    where: and(
      eq(posts.status, "published"),
      ne(posts.id, post.id),
      arrayOverlaps(posts.categories, post.categories),
    ),
    orderBy: [desc(posts.createdAt)],
    limit,
  });
}

async function uniquePostSlug(
  baseValue: string,
  excludeId?: string,
): Promise<string> {
  const base = slugifyPostTitle(baseValue) || "post";
  let candidate = base;
  let counter = 1;

  for (;;) {
    const existing = await db.query.posts.findFirst({
      where: excludeId
        ? and(eq(posts.slug, candidate), ne(posts.id, excludeId))
        : eq(posts.slug, candidate),
      columns: { id: true },
    });
    if (!existing) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

export async function createPost(input: {
  title: string;
  slug?: string;
  status: PostStatus;
  body: string | null;
  categories: string[];
  authorId: string;
  featuredImageUrl?: string | null;
}): Promise<PostRecord> {
  const slug = await uniquePostSlug(input.slug || input.title);

  const [post] = await db
    .insert(posts)
    .values({
      title: input.title,
      slug,
      status: input.status,
      body: input.body,
      categories: input.categories,
      authorId: input.authorId,
      featuredImageUrl: input.featuredImageUrl?.trim() || null,
    })
    .returning();

  if (!post) throw new Error("Failed to create post");
  return post;
}

export async function updatePost(
  id: string,
  input: {
    title?: string;
    slug?: string;
    status?: PostStatus;
    body?: string | null;
    categories?: string[];
    featuredImageUrl?: string | null;
  },
): Promise<PostRecord | null> {
  const existing = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });
  if (!existing) return null;

  if (
    input.featuredImageUrl !== undefined &&
    existing.featuredImageUrl &&
    existing.featuredImageUrl !== (input.featuredImageUrl?.trim() || null)
  ) {
    await deleteManagedUpload(existing.featuredImageUrl);
  }

  const title = input.title ?? existing.title;
  const requestedSlug = input.slug?.trim() || title;
  const slug =
    requestedSlug === existing.slug
      ? existing.slug
      : await uniquePostSlug(requestedSlug, existing.id);

  const [post] = await db
    .update(posts)
    .set({
      title,
      slug,
      status: input.status ?? existing.status,
      body: input.body === undefined ? existing.body : input.body,
      categories: input.categories ?? existing.categories,
      featuredImageUrl:
        input.featuredImageUrl === undefined
          ? existing.featuredImageUrl
          : input.featuredImageUrl?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  return post ?? null;
}

export async function deletePost(id: string): Promise<boolean> {
  const existing = await getPostById(id);
  if (!existing) return false;

  await deleteManagedUpload(existing.featuredImageUrl);

  const [deleted] = await db
    .delete(posts)
    .where(eq(posts.id, id))
    .returning({ id: posts.id });
  return Boolean(deleted);
}

export async function prepareInlinePostImage(
  postId: string,
): Promise<ImageRecord> {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    columns: { id: true },
  });
  if (!post) throw new Error("Post not found");

  const [row] = await db
    .insert(images)
    .values({
      postId: post.id,
      url: "",
      name: "pending-upload",
      mimeType: null,
    })
    .returning();

  if (!row) throw new Error("Failed to prepare inline image");
  return row;
}
