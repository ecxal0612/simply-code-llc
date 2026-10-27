import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { pageStatusSchema } from "~/lib/pages/section-schema";
import { isAdminRole } from "~/lib/auth/roles";
import { deletePage, getPageById, updatePage } from "~/server/pages";

const updatePageSchema = z.object({
  title: z.string().trim().min(1).max(256).optional(),
  slug: z.string().trim().max(256).optional(),
  status: pageStatusSchema.optional(),
  bodyHtml: z.string().max(200_000).nullable().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const page = await getPageById(id);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({ page });
}

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

  const parsed = updatePageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid page data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id } = await params;
  try {
    const page = await updatePage(id, {
      title: parsed.data.title,
      slug: parsed.data.slug,
      status: parsed.data.status,
      body: parsed.data.bodyHtml,
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch {
    return NextResponse.json(
      { error: "Could not update page" },
      { status: 500 },
    );
  }
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
  const deleted = await deletePage(id);
  if (!deleted) {
    return NextResponse.json(
      { error: "Page not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ deleted: true });
}
