import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { preparePageSectionImage } from "~/server/pages";

const bodySchema = z.object({
  pageId: z.string().uuid(),
  sectionKey: z.string().min(1).max(128),
  slot: z.string().min(1).max(256),
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
    const image = await preparePageSectionImage(parsed.data);
    return NextResponse.json({
      imageId: image.id,
      slot: image.slot,
      url: image.url,
    });
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
