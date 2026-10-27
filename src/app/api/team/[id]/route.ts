import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import { teamMemberInputSchema } from "~/lib/team/schema";
import {
  deleteTeamMember,
  normalizeTeamMemberValues,
  updateTeamMember,
} from "~/server/team";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = teamMemberInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid team member data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id } = await params;
  const member = await updateTeamMember(
    id,
    normalizeTeamMemberValues(parsed.data),
  );
  if (!member) {
    return NextResponse.json(
      { error: "Team member not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ member });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const deleted = await deleteTeamMember(id);
  if (!deleted) {
    return NextResponse.json(
      { error: "Team member not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
