export type HomepageImageSlotId = "home.hero" | "home.experience";

export type HomepageImageSlot = {
  id: HomepageImageSlotId;
  sectionId: "hero" | "experience";
  sectionTitle: string;
  label: string;
  description: string;
};

export const homepageImageSlots: HomepageImageSlot[] = [
  {
    id: "home.hero",
    sectionId: "hero",
    sectionTitle: "Hero",
    label: "Hero background",
    description: "Full-width background behind the main headline on the homepage.",
  },
  {
    id: "home.experience",
    sectionId: "experience",
    sectionTitle: "Experience",
    label: "Experience section image",
    description: "Image shown beside the Zoom / enterprise experience copy.",
  },
];

export const homepageImageSlotIds = homepageImageSlots.map((s) => s.id);

export function isHomepageImageSlotId(value: string): value is HomepageImageSlotId {
  return homepageImageSlotIds.includes(value as HomepageImageSlotId);
}

export function getHomepageImageSlot(id: HomepageImageSlotId): HomepageImageSlot {
  const slot = homepageImageSlots.find((s) => s.id === id);
  if (!slot) throw new Error(`Unknown homepage image slot: ${id}`);
  return slot;
}

export const homepageImageSections = [
  { id: "hero" as const, title: "Hero" },
  { id: "experience" as const, title: "Experience" },
];
