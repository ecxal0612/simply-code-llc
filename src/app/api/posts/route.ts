import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { createPostSchema } from "~/schemas/post";
import { db } from "~/server/db";
import { images, posts } from "~/server/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db.query.posts.findMany({
    where: eq(posts.authorId, session.user.id),
    orderBy: [desc(posts.createdAt)],
    limit: 20,
    with: { images: true },
  });

  return NextResponse.json({ posts: rows });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = createPostSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid post data" },
      { status: 400 },
    );
  }

  const { title, body, images: uploadedImages } = parsed.data;

  const [post] = await db
    .insert(posts)
    .values({
      title,
      body: body?.length ? body : null,
      authorId: session.user.id,
    })
    .returning();

  if (!post) {
    return NextResponse.json({ error: "Could not create post" }, { status: 500 });
  }

  // neon-http has no interactive transactions; insert images right after the post.
  if (uploadedImages.length > 0) {
    await db.insert(images).values(
      uploadedImages.map((image) => ({
        postId: post.id,
        url: image.url,
        name: image.name ?? null,
        size: image.size ?? null,
        mimeType: image.mimeType ?? null,
      })),
    );
  }

  const created = await db.query.posts.findFirst({
    where: eq(posts.id, post.id),
    with: { images: true },
  });

  return NextResponse.json({ post: created }, { status: 201 });
}
