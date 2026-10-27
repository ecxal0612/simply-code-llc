/** Stable Uploadthing / images.slot key for the public site logo. */
export const SITE_LOGO_SLOT = "site.logo";

export const DEFAULT_HEADER_NAV_PATHS = [
  "/",
  "/about",
  "/services",
  "/work",
  "/blog",
  "/contact",
] as const;

export type SiteNavItem = {
  href: string;
  label: string;
};
