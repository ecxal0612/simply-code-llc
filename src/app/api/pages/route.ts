import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { pageStatusSchema } from "~/lib/pages/section-schema";
import { createPage, listPages } from "~/server/pages";

const createPageSchema = z.object({
  title: z.string().trim().min(1).max(256),
  slug: z.string().trim().max(256).optional(),
  status: pageStatusSchema.default("draft"),
  bodyHtml: z.string().max(200_000).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await listPages();
  return NextResponse.json({ pages: rows });
}

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

  const parsed = createPageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid page data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const page = await createPage({
      title: parsed.data.title,
      slug: parsed.data.slug,
      status: parsed.data.status,
      body: parsed.data.bodyHtml?.trim() ? parsed.data.bodyHtml : null,
      createdById: session.user.id,
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not create page" },
      { status: 500 },
    );
  }
}
