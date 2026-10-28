import { homeImages } from "~/lib/home/content";

/** Default image for a page image slot until an editor uploads a replacement. */
export const defaultPageImageUrls: Record<string, string> = {
  "home.hero": homeImages.hero,
  "home.experience": homeImages.experience,
  "work.experience":
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
};

export function getDefaultPageImageUrl(slot: string): string {
  return defaultPageImageUrls[slot] ?? homeImages.hero;
}
