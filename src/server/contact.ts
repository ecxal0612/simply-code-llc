import "server-only";

import { and, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { ContactMessageInput } from "~/lib/contact/schema";
import { db } from "~/server/db";
import {
  contactMessageReplies,
  contactMessages,
} from "~/server/db/schema";

export type ContactMessageRecord = typeof contactMessages.$inferSelect;
export type ContactMessageReplyRecord =
  typeof contactMessageReplies.$inferSelect;

function optionalValue(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createContactMessage(
  input: ContactMessageInput,
): Promise<ContactMessageRecord> {
  const [message] = await db
    .insert(contactMessages)
    .values({
      name: input.name,
      email: input.email,
      company: optionalValue(input.company),
      projectType: input.projectType,
      budget: optionalValue(input.budget),
      details: input.details,
    })
    .returning();

  if (!message) throw new Error("Failed to save contact message");
  return message;
}

export async function listContactMessages(options?: {
  archived?: boolean;
}): Promise<ContactMessageRecord[]> {
  const archived = options?.archived ?? false;
  return db.query.contactMessages.findMany({
    where: archived
      ? isNotNull(contactMessages.archivedAt)
      : isNull(contactMessages.archivedAt),
    orderBy: [desc(contactMessages.createdAt)],
  });
}

export function unreadContactMessagesWhere(): SQL {
  return and(
    eq(contactMessages.status, "new"),
    isNull(contactMessages.archivedAt),
  )!;
}

export async function countUnreadContactMessages(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contactMessages)
    .where(unreadContactMessagesWhere());

  return row?.count ?? 0;
}

export async function listUnreadContactMessageIds(): Promise<string[]> {
  const rows = await db
    .select({ id: contactMessages.id })
    .from(contactMessages)
    .where(unreadContactMessagesWhere())
    .orderBy(desc(contactMessages.createdAt));

  return rows.map((row) => row.id);
}

export async function getContactMessageById(
  id: string,
): Promise<ContactMessageRecord | null> {
  const message = await db.query.contactMessages.findFirst({
    where: eq(contactMessages.id, id),
  });
  return message ?? null;
}

export async function listContactMessageReplies(
  messageId: string,
): Promise<ContactMessageReplyRecord[]> {
  return db.query.contactMessageReplies.findMany({
    where: eq(contactMessageReplies.messageId, messageId),
    orderBy: [desc(contactMessageReplies.createdAt)],
  });
}

export async function markContactMessageRead(
  id: string,
): Promise<ContactMessageRecord | null> {
  const existing = await getContactMessageById(id);
  if (!existing) return null;
  if (existing.readAt) return existing;

  const now = new Date();
  const [message] = await db
    .update(contactMessages)
    .set({
      readAt: now,
      status:
        existing.status === "replied"
          ? "replied"
          : existing.status === "new"
            ? "read"
            : existing.status,
      updatedAt: now,
    })
    .where(eq(contactMessages.id, id))
    .returning();

  return message ?? null;
}

export async function setContactMessageArchived(
  id: string,
  archived: boolean,
): Promise<ContactMessageRecord | null> {
  const now = new Date();
  const [message] = await db
    .update(contactMessages)
    .set({
      archivedAt: archived ? now : null,
      updatedAt: now,
    })
    .where(eq(contactMessages.id, id))
    .returning();

  return message ?? null;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const [deleted] = await db
    .delete(contactMessages)
    .where(eq(contactMessages.id, id))
    .returning({ id: contactMessages.id });

  return Boolean(deleted);
}

export async function saveContactMessageReply(
  id: string,
  input: {
    body: string;
    emailSentAt: Date | null;
    sentByUserId: string;
  },
): Promise<ContactMessageRecord | null> {
  const existing = await getContactMessageById(id);
  if (!existing) return null;

  const now = new Date();
  const [message] = await db
    .update(contactMessages)
    .set({
      replyBody: input.body,
      repliedAt: now,
      replyEmailSentAt: input.emailSentAt,
      status: "replied",
      readAt: existing.readAt ?? now,
      updatedAt: now,
    })
    .where(eq(contactMessages.id, id))
    .returning();

  if (!message) return null;

  await db.insert(contactMessageReplies).values({
    messageId: id,
    body: input.body,
    sentByUserId: input.sentByUserId,
    replyEmailSentAt: input.emailSentAt,
  });

  return message;
}
