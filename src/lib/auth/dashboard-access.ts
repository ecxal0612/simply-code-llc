import { neon } from "@neondatabase/serverless";
import { env } from "~/env";

type RevokedRow = { dashboard_access_revoked_at: string | null };

export async function isDashboardAccessRevoked(userId: string): Promise<boolean> {
  const sql = neon(env.DATABASE_URL);
  const table = `${env.DB_TABLE_PREFIX}_users`;
  const rows = (await sql.query(
    `SELECT dashboard_access_revoked_at FROM ${table} WHERE id = $1 LIMIT 1`,
    [userId],
  )) as RevokedRow[];

  const revokedAt = rows[0]?.dashboard_access_revoked_at;
  return revokedAt != null;
}
