import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "~/lib/auth.config";
import { DashboardAccessRevoked } from "~/lib/auth/errors";
import { loginSchema } from "~/schemas/auth";
import { verifyPassword } from "~/server/auth/password";
import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const row = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        if (!row?.passwordHash) return null;

        if (row.dashboardAccessRevokedAt) {
          throw new DashboardAccessRevoked();
        }

        const valid = await verifyPassword(
          parsed.data.password,
          row.passwordHash,
        );
        if (!valid) return null;

        return {
          id: row.id,
          email: row.email ?? email,
          name: row.name,
          image: row.image,
          role: row.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.id) return true;

      const row = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: { dashboardAccessRevokedAt: true },
      });

      if (row?.dashboardAccessRevokedAt) {
        return "/login?error=access_revoked";
      }

      return true;
    },
  },
});
