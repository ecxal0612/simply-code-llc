import { relations, sql } from "drizzle-orm";
import {
  integer,
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

/** All app tables are prefixed via `DB_TABLE_PREFIX` (multi-app Neon clusters). */
export const createTable = pgTableCreator((name) => `${env.DB_TABLE_PREFIX}_${name}`);

/** Extend with app-specific roles as products grow. */
export const userRoleEnum = pgEnum(`${env.DB_TABLE_PREFIX}_user_role`, ["user", "admin"]);

export const users = createTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  /** Argon2id hash; null when the account is OAuth-only. */
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("user"),
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
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (table) => ({
    providerAccountUnique: uniqueIndex(`${env.DB_TABLE_PREFIX}_accounts_provider_account_unique`).on(
      table.provider,
      table.providerAccountId,
    ),
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

/** Example domain table — replace or extend per project. */
export const posts = createTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 256 }).notNull(),
  body: text("body"),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/** Uploadthing files — post attachments (`postId`) or homepage slots (`slot`). */
export const images = createTable(
  "images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull(),
    name: varchar("name", { length: 256 }),
    size: integer("size"),
    mimeType: varchar("mime_type", { length: 255 }),
    postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
    /** Stable homepage key, e.g. `home.hero`, `home.team.0`. */
    slot: varchar("slot", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    slotUnique: uniqueIndex(`${env.DB_TABLE_PREFIX}_images_slot_unique`).on(table.slot),
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
}));

export type UserRole = (typeof userRoleEnum.enumValues)[number];
