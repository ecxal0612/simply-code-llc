import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { teamMemberInputSchema } from "~/lib/team/schema";
import { createTeamMember, normalizeTeamMemberValues } from "~/server/team";

export async function POST(req: Request) {
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

  const member = await createTeamMember(normalizeTeamMemberValues(parsed.data));
  return NextResponse.json({ member }, { status: 201 });
}
