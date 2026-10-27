import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { createPostSchema } from "~/lib/posts/schema";
import { createPost, listPosts } from "~/server/posts";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await listPosts();
  return NextResponse.json({ posts: rows });
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

  const parsed = createPostSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid post data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const post = await createPost({
      title: parsed.data.title,
      slug: parsed.data.slug,
      status: parsed.data.status,
      body: parsed.data.bodyHtml?.trim() ? parsed.data.bodyHtml : null,
      categories: parsed.data.categories,
      authorId: session.user.id,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not create post" },
      { status: 500 },
    );
  }
}
