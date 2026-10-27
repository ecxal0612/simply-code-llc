import { z } from "zod";

export const projectLinkSchema = z.object({
  label: z.string().trim().min(1).max(120),
  url: z.string().trim().url().max(2048),
});

export const projectInputSchema = z.object({
  title: z.string().trim().min(1).max(256),
  description: z.string().trim().max(20_000).optional(),
  label: z.string().trim().max(200).optional(),
  projectDate: z.string().trim().max(100).optional(),
  imageUrl: z
    .union([z.string().trim().url().max(2048), z.literal("")])
    .optional(),
  links: z.array(projectLinkSchema).max(8).optional(),
});

export const updateProjectSchema = projectInputSchema.partial();
