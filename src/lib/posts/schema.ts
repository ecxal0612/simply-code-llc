import { z } from "zod";
import { normalizePostCategories } from "~/lib/posts/types";

export const postStatusSchema = z.enum(["draft", "published"]);

const postCategoriesSchema = z
  .array(z.string().max(200))
  .max(50)
  .transform(normalizePostCategories);

const featuredImageUrlSchema = z
  .string()
  .trim()
  .url()
  .max(2048)
  .nullable()
  .optional();

export const createPostSchema = z.object({
  title: z.string().trim().min(1).max(256),
  slug: z.string().trim().max(80).optional(),
  status: postStatusSchema.default("draft"),
  bodyHtml: z.string().max(200_000).optional(),
  categories: postCategoriesSchema.optional().default([]),
  featuredImageUrl: featuredImageUrlSchema,
});

export const updatePostSchema = z.object({
  title: z.string().trim().min(1).max(256).optional(),
  slug: z.string().trim().max(80).optional(),
  status: postStatusSchema.optional(),
  bodyHtml: z.string().max(200_000).nullable().optional(),
  categories: postCategoriesSchema.optional(),
  featuredImageUrl: featuredImageUrlSchema,
});
