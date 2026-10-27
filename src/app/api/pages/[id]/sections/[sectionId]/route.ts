import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { pageSectionContentSchema } from "~/lib/pages/section-schema";
import { updatePageSection } from "~/server/pages";

const bodySchema = z.object({
  content: pageSectionContentSchema,
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> },
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

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid section data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id, sectionId } = await params;
  const section = await updatePageSection(id, sectionId, parsed.data.content);
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  return NextResponse.json({ section });
}
