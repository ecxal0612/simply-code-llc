import { NextResponse } from "next/server";
import { z } from "zod";
import { isHomepageImageSlotId } from "~/lib/home/image-slots";
import { auth } from "~/lib/auth";
import { prepareHomepageImageSlot } from "~/server/homepage-images";

const bodySchema = z.object({
  slot: z.string().min(1),
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
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!isHomepageImageSlotId(parsed.data.slot)) {
    return NextResponse.json({ error: "Unknown image slot" }, { status: 400 });
  }

  try {
    const row = await prepareHomepageImageSlot(parsed.data.slot);
    return NextResponse.json({
      ok: true,
      imageId: row.id,
      slot: row.slot,
      url: row.url,
    });
  } catch {
    return NextResponse.json({ error: "Could not prepare image slot" }, { status: 500 });
  }
}
