import { NextResponse } from "next/server";
import { homepageImageSlots } from "~/lib/home/image-slots";
import { auth } from "~/lib/auth";
import { getDefaultUrlForSlot, getHomepageImagesBySlot } from "~/server/homepage-images";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bySlot = await getHomepageImagesBySlot();

  const slots = homepageImageSlots.map((definition) => {
    const row = bySlot.get(definition.id);
    return {
      ...definition,
      url: row?.url ?? getDefaultUrlForSlot(definition.id),
      imageId: row?.id ?? null,
      isCustom: !!row,
      updatedAt: row?.createdAt ?? null,
    };
  });

  return NextResponse.json({ slots });
}
