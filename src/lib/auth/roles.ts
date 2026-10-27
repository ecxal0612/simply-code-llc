/** True when the session user has the admin role. */
export function isAdminRole(role: string | undefined | null): boolean {
  return role === "admin";
}
