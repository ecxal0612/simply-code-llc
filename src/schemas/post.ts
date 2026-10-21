import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(256),
  body: z.string().trim().max(10_000).optional(),
  /** Metadata returned by Uploadthing after the client uploads the files. */
  images: z
    .array(
      z.object({
        url: z.string().url(),
        name: z.string().max(256).optional(),
        size: z.number().int().nonnegative().optional(),
        mimeType: z.string().max(255).optional(),
      }),
    )
    .max(4, "Up to 4 images per post")
    .default([]),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

/** Client-side form model; images are handled separately as raw `File`s. */
export const postFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(256),
  body: z.string().trim().max(10_000).optional(),
});

export type PostFormInput = z.infer<typeof postFormSchema>;

export const MAX_POST_IMAGES = 4;
