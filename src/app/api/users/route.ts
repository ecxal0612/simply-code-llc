import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import { listUsers } from "~/server/users";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await listUsers();
  return NextResponse.json({ users });
}
