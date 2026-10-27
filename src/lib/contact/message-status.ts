import type { contactMessages } from "~/server/db/schema";

type ContactMessage = typeof contactMessages.$inferSelect;

export type ContactMessageListStatus = "new" | "read" | "replied";

export function getContactMessageListStatus(
  message: Pick<ContactMessage, "status" | "readAt">,
): ContactMessageListStatus {
  if (message.status === "replied") return "replied";
  if (message.status === "read" || message.readAt) return "read";
  return "new";
}

export const contactMessageStatusLabels: Record<
  ContactMessageListStatus,
  string
> = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

export function contactMessageStatusClassName(
  status: ContactMessageListStatus,
): string {
  switch (status) {
    case "replied":
      return "rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300";
    case "read":
      return "rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300";
    default:
      return "rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:text-sky-300";
  }
}
