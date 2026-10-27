import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { env } from "~/env";
import type { PageSectionContent } from "~/lib/pages/types";

/** All app tables are prefixed via `DB_TABLE_PREFIX` (multi-app Neon clusters). */
export const createTable = pgTableCreator(
  (name) => `${env.DB_TABLE_PREFIX}_${name}`,
);

/** Extend with app-specific roles as products grow. */
export const userRoleEnum = pgEnum(`${env.DB_TABLE_PREFIX}_user_role`, [
  "user",
  "admin",
]);

export const users = createTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  /** Argon2id hash; null when the account is OAuth-only. */
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("user"),
  /** When set, the user cannot sign in to or use the dashboard. */
  dashboardAccessRevokedAt: timestamp("dashboard_access_revoked_at", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const accounts = createTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (table) => ({
    providerAccountUnique: uniqueIndex(
      `${env.DB_TABLE_PREFIX}_accounts_provider_account_unique`,
    ).on(table.provider, table.providerAccountId),
  }),
);

export const sessions = createTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = createTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  }),
);

export const postStatusEnum = pgEnum(`${env.DB_TABLE_PREFIX}_post_status`, [
  "draft",
  "published",
]);

/** Blog posts authored from the dashboard. */
export const posts = createTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 256 }).notNull(),
    slug: varchar("slug", { length: 256 }).notNull().unique(),
    status: postStatusEnum("status").notNull().default("draft"),
    /** Rich HTML produced by the dashboard WYSIWYG editor. */
    body: text("body"),
    featuredImageUrl: text("featured_image_url"),
    categories: text("categories")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    statusCreatedAtIdx: index(
      `${env.DB_TABLE_PREFIX}_posts_status_created_at_idx`,
    ).on(table.status, table.createdAt),
  }),
);

export const contactMessageStatusEnum = pgEnum(
  `${env.DB_TABLE_PREFIX}_contact_message_status`,
  ["new", "read", "replied"],
);

/** Inquiries submitted through the public contact form. */
export const contactMessages = createTable(
  "contact_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    company: varchar("company", { length: 200 }),
    projectType: varchar("project_type", { length: 200 }).notNull(),
    budget: varchar("budget", { length: 200 }),
    details: text("details").notNull(),
    status: contactMessageStatusEnum("status").notNull().default("new"),
    /** Set when an admin opens the message in the dashboard. */
    readAt: timestamp("read_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** Denormalized copy of the latest reply for quick list queries. */
    replyBody: text("reply_body"),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    /** Set only when the latest reply was accepted by the email provider. */
    replyEmailSentAt: timestamp("reply_email_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    statusCreatedAtIdx: index(
      `${env.DB_TABLE_PREFIX}_contact_messages_status_created_at_idx`,
    ).on(table.status, table.createdAt),
    archivedCreatedAtIdx: index(
      `${env.DB_TABLE_PREFIX}_contact_messages_archived_created_at_idx`,
    ).on(table.archivedAt, table.createdAt),
  }),
);

export const contactMessageReplies = createTable(
  "contact_message_replies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => contactMessages.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    sentByUserId: uuid("sent_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    replyEmailSentAt: timestamp("reply_email_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    messageCreatedAtIdx: index(
      `${env.DB_TABLE_PREFIX}_contact_message_replies_message_created_at_idx`,
    ).on(table.messageId, table.createdAt),
  }),
);

export const contactMessagesRelations = relations(
  contactMessages,
  ({ many }) => ({
    replies: many(contactMessageReplies),
  }),
);

export const contactMessageRepliesRelations = relations(
  contactMessageReplies,
  ({ one }) => ({
    message: one(contactMessages, {
      fields: [contactMessageReplies.messageId],
      references: [contactMessages.id],
    }),
    sentBy: one(users, {
      fields: [contactMessageReplies.sentByUserId],
      references: [users.id],
    }),
  }),
);

export const pageStatusEnum = pgEnum(`${env.DB_TABLE_PREFIX}_page_status`, [
  "draft",
  "published",
]);

/** CMS pages. Built-in marketing pages are seeded with `isSystem: true`. */
export const pages = createTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  path: varchar("path", { length: 256 }).notNull().unique(),
  status: pageStatusEnum("status").notNull().default("draft"),
  isSystem: boolean("is_system").notNull().default(false),
  /** Rich HTML for custom pages created from the dashboard. */
  body: text("body"),
  createdById: uuid("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/** Editable content blocks that make up each page. */
export const pageSections = createTable(
  "page_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 128 }).notNull(),
    label: varchar("label", { length: 256 }).notNull(),
    kind: varchar("kind", { length: 64 }).notNull(),
    content: jsonb("content").$type<PageSectionContent>().notNull().default({}),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    pageKeyUnique: uniqueIndex(
      `${env.DB_TABLE_PREFIX}_page_sections_page_key_unique`,
    ).on(table.pageId, table.key),
  }),
);

export type ProjectLink = {
  label: string;
  url: string;
};

/** Portfolio projects selectable in homepage and work page sections. */
export const projects = createTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  /** Short label or role shown above the title (e.g. category). */
  label: varchar("label", { length: 200 }),
  /** Display date string (e.g. year or month/year). */
  projectDate: varchar("project_date", { length: 100 }),
  imageUrl: text("image_url"),
  links: jsonb("links")
    .$type<ProjectLink[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/** Team members shown in the dashboard and selectable in About Us team items. */
export const teamMembers = createTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  role: varchar("role", { length: 200 }),
  bio: text("bio"),
  imageUrl: text("image_url"),
  technologies: jsonb("technologies")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/** Uploadthing files — page/section images, post attachments, or homepage slots. */
export const images = createTable(
  "images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull(),
    name: varchar("name", { length: 256 }),
    size: integer("size"),
    mimeType: varchar("mime_type", { length: 255 }),
    postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
    pageId: uuid("page_id").references(() => pages.id, { onDelete: "cascade" }),
    sectionKey: varchar("section_key", { length: 128 }),
    /** Stable image key, e.g. `home.hero`, `about.hero`. */
    slot: varchar("slot", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    slotUnique: uniqueIndex(`${env.DB_TABLE_PREFIX}_images_slot_unique`).on(
      table.slot,
    ),
  }),
);

export const pagesRelations = relations(pages, ({ many }) => ({
  sections: many(pageSections),
  images: many(images),
}));

export const pageSectionsRelations = relations(
  pageSections,
  ({ one, many }) => ({
    page: one(pages, {
      fields: [pageSections.pageId],
      references: [pages.id],
    }),
    images: many(images),
  }),
);

export const postsRelations = relations(posts, ({ many }) => ({
  images: many(images),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  post: one(posts, {
    fields: [images.postId],
    references: [posts.id],
  }),
  page: one(pages, {
    fields: [images.pageId],
    references: [pages.id],
  }),
}));

export type UserRole = (typeof userRoleEnum.enumValues)[number];

/** Singleton row for public site chrome (header nav, etc.). */
export const siteSettings = createTable("site_settings", {
  singleton: varchar("singleton", { length: 16 }).primaryKey().default("default"),
  /** Ordered page paths shown in the public header nav. Empty = built-in defaults. */
  headerNavPaths: text("header_nav_paths")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
