import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import {
  deleteContactMessage,
  getContactMessageById,
  setContactMessageArchived,
} from "~/server/contact";

const patchSchema = z.object({
  action: z.enum(["archive", "unarchive"]),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!isAdminRole(session.user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const { id } = await params;
  const existing = await getContactMessageById(id);
  if (!existing) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const updated = await setContactMessageArchived(
    id,
    parsed.data.action === "archive",
  );

  if (!updated) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  return NextResponse.json({ message: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const deleted = await deleteContactMessage(id);
  if (!deleted) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
