import { z } from "zod";

export const teamMemberInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  role: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(5000).optional(),
  imageUrl: z.string().trim().max(2048).optional(),
  technologies: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
});

export type TeamMemberInput = z.infer<typeof teamMemberInputSchema>;

/** Converts comma-separated form input into the normalized technology list. */
export function parseTechnologies(value: string): string[] {
  const seen = new Set<string>();
  for (const entry of value.split(",")) {
    const technology = entry.trim();
    if (technology) seen.add(technology);
  }
  return Array.from(seen);
}
