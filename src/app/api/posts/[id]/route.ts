import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { updatePostSchema } from "~/lib/posts/schema";
import { deletePost, getPostById, updatePost } from "~/server/posts";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
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

  const parsed = updatePostSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid post data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id } = await params;
  const post = await updatePost(id, {
    title: parsed.data.title,
    slug: parsed.data.slug,
    status: parsed.data.status,
    body:
      parsed.data.bodyHtml === undefined
        ? undefined
        : parsed.data.bodyHtml?.trim()
          ? parsed.data.bodyHtml
          : null,
    categories: parsed.data.categories,
    featuredImageUrl:
      parsed.data.featuredImageUrl === undefined
        ? undefined
        : parsed.data.featuredImageUrl,
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deletePost(id);
  if (!deleted) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
