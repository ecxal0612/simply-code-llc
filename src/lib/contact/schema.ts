import { z } from "zod";

/** Shared by the public form and the API route so validation never drifts. */
export const contactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(200, "Please keep your name under 200 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address.")
    .max(320, "Please keep your email under 320 characters."),
  company: z
    .string()
    .trim()
    .max(200, "Please keep the company name under 200 characters.")
    .optional(),
  projectType: z
    .string()
    .trim()
    .min(1, "Please select a project type.")
    .max(200),
  budget: z
    .string()
    .trim()
    .max(200, "Please keep the budget under 200 characters.")
    .optional(),
  details: z
    .string()
    .trim()
    .min(10, "Please share a little more detail (at least 10 characters).")
    .max(10_000, "Please keep your message under 10,000 characters."),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const contactReplySchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write a reply before sending it.")
    .max(10_000, "Please keep your reply under 10,000 characters."),
});

export type ContactReplyInput = z.infer<typeof contactReplySchema>;
