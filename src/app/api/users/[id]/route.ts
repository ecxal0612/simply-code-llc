import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import {
  restoreUserDashboardAccess,
  revokeUserDashboardAccess,
  updateUserRole,
} from "~/server/users";

const updateSchema = z
  .object({
    role: z.enum(["user", "admin"]).optional(),
    revokeDashboardAccess: z.literal(true).optional(),
    restoreDashboardAccess: z.literal(true).optional(),
  })
  .refine(
    (value) =>
      value.role !== undefined ||
      value.revokeDashboardAccess ||
      value.restoreDashboardAccess,
    { message: "No changes requested" },
  )
  .refine(
    (value) => !(value.revokeDashboardAccess && value.restoreDashboardAccess),
    { message: "Conflicting dashboard access actions" },
  );

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const { id } = await params;

  if (parsed.data.revokeDashboardAccess) {
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot remove your own dashboard access" },
        { status: 400 },
      );
    }

    const user = await revokeUserDashboardAccess(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  }

  if (parsed.data.restoreDashboardAccess) {
    const user = await restoreUserDashboardAccess(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  }

  if (parsed.data.role) {
    if (id === session.user.id && parsed.data.role !== "admin") {
      return NextResponse.json(
        { error: "You cannot remove your own admin access" },
        { status: 400 },
      );
    }

    const user = await updateUserRole(id, parsed.data.role);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  }

  return NextResponse.json({ error: "No changes requested" }, { status: 400 });
}
