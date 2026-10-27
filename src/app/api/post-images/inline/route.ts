import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { prepareInlinePostImage } from "~/server/posts";

const bodySchema = z.object({
  postId: z.string().uuid(),
});

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

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
  }

  try {
    const image = await prepareInlinePostImage(parsed.data.postId);
    return NextResponse.json({ imageId: image.id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not prepare image",
      },
      { status: 400 },
    );
  }
}
