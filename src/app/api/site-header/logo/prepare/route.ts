import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { prepareSiteLogoImage } from "~/server/site-header";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const image = await prepareSiteLogoImage();
    return NextResponse.json({ imageId: image.id });
  } catch {
    return NextResponse.json(
      { error: "Could not prepare logo in database" },
      { status: 500 },
    );
  }
}
