import "server-only";

import { asc, eq } from "drizzle-orm";
import type { UserRole } from "~/server/db/schema";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export type UserListItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  dashboardAccessRevokedAt: Date | null;
};

export async function listUsers(): Promise<UserListItem[]> {
  return db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      dashboardAccessRevokedAt: true,
    },
    orderBy: [asc(users.createdAt)],
  });
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<UserListItem | null> {
  const [updated] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      dashboardAccessRevokedAt: users.dashboardAccessRevokedAt,
    });

  return updated ?? null;
}

export async function revokeUserDashboardAccess(
  userId: string,
): Promise<UserListItem | null> {
  const now = new Date();
  const [updated] = await db
    .update(users)
    .set({ dashboardAccessRevokedAt: now })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      dashboardAccessRevokedAt: users.dashboardAccessRevokedAt,
    });

  return updated ?? null;
}

export async function restoreUserDashboardAccess(
  userId: string,
): Promise<UserListItem | null> {
  const [updated] = await db
    .update(users)
    .set({ dashboardAccessRevokedAt: null })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      dashboardAccessRevokedAt: users.dashboardAccessRevokedAt,
    });

  return updated ?? null;
}
