/** Shared page-content types (safe to import from client and server code). */

import type { ContactFormContent } from "~/lib/contact/form-content";

export type PageStatus = "draft" | "published";

export type PageSectionImage = {
  /** Stable image key stored on `images.slot`. */
  slot: string;
  label?: string;
  alt?: string;
};

export type PageSectionItem = {
  title?: string;
  description?: string;
  meta?: string;
  href?: string;
  /** Reference to a dashboard team member (used by the About Us team section). */
  memberId?: string;
  /** Reference to a dashboard portfolio project (home/work project sections). */
  projectId?: string;
};

export type PageSectionContent = {
  eyebrow?: string;
  title?: string;
  /** Rich HTML produced by the dashboard WYSIWYG editor. */
  bodyHtml?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  items?: PageSectionItem[];
  images?: PageSectionImage[];
  /** Editable labels and copy for the public contact form. */
  contactForm?: ContactFormContent;
  /** Display date for policy-style pages. */
  updatedAtLabel?: string;
  /** Blog listing page size (6, 9, or 12). Used by `blog-posts` sections. */
  postsPerPage?: number;
};

export type PageSectionKind =
  | "home-hero"
  | "home-services"
  | "home-experience"
  | "home-technology"
  | "home-process"
  | "home-projects"
  | "home-contact"
  | "hero"
  | "about-who"
  | "about-team"
  | "about-why"
  | "services-intro"
  | "services-features"
  | "work-experience"
  | "work-projects"
  | "testimonials"
  | "blog-posts"
  | "contact-intro"
  | "policy-hero"
  | "policy"
  | "cta"
  | "rich";

export function slugifyPageTitle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Paths that must not be used by user-created pages. */
export const reservedPageSlugs = new Set([
  "api",
  "dashboard",
  "login",
  "register",
  "sign-out",
  "admin",
  "settings",
  "profile",
  "posts",
  "pages",
]);
