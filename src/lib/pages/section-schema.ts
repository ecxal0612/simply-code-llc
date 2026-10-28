import { z } from "zod";
import type { PageSectionContent } from "~/lib/pages/types";

export const pageSectionContentSchema = z.object({
  eyebrow: z.string().max(500).optional(),
  title: z.string().max(1000).optional(),
  bodyHtml: z.string().max(100_000).optional(),
  ctaLabel: z.string().max(200).optional(),
  ctaHref: z.string().max(500).optional(),
  secondaryCtaLabel: z.string().max(200).optional(),
  secondaryCtaHref: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        title: z.string().max(500).optional(),
        description: z.string().max(5000).optional(),
        meta: z.string().max(500).optional(),
        href: z.string().max(500).optional(),
        memberId: z.string().uuid().optional(),
        projectId: z.string().uuid().optional(),
      }),
    )
    .max(100)
    .optional(),
  images: z
    .array(
      z.object({
        slot: z.string().min(1).max(256),
        label: z.string().max(256).optional(),
        alt: z.string().max(500).optional(),
      }),
    )
    .max(30)
    .optional(),
  contactForm: z
    .object({
      nameLabel: z.string().max(200).optional(),
      namePlaceholder: z.string().max(500).optional(),
      emailLabel: z.string().max(200).optional(),
      emailPlaceholder: z.string().max(500).optional(),
      companyLabel: z.string().max(200).optional(),
      companyPlaceholder: z.string().max(500).optional(),
      projectTypeLabel: z.string().max(200).optional(),
      projectTypePlaceholder: z.string().max(500).optional(),
      projectTypeOptions: z.array(z.string().max(200)).max(50).optional(),
      budgetLabel: z.string().max(200).optional(),
      budgetPlaceholder: z.string().max(500).optional(),
      budgetOptions: z.array(z.string().max(200)).max(50).optional(),
      detailsLabel: z.string().max(200).optional(),
      detailsPlaceholder: z.string().max(500).optional(),
      submitLabel: z.string().max(200).optional(),
      successTitle: z.string().max(200).optional(),
      successMessage: z.string().max(2000).optional(),
      sendAnotherLabel: z.string().max(200).optional(),
      privacyText: z.string().max(2000).optional(),
      privacyLinkLabel: z.string().max(200).optional(),
    })
    .optional(),
  updatedAtLabel: z.string().max(100).optional(),
  postsPerPage: z.union([z.literal(6), z.literal(9), z.literal(12)]).optional(),
}) satisfies z.ZodType<PageSectionContent>;

export const pageStatusSchema = z.enum(["draft", "published"]);
