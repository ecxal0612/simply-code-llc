import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import {
  getStoredHeaderNavPaths,
  updateHeaderNavPaths,
} from "~/server/site-header";

const updateSchema = z.object({
  headerNavPaths: z.array(z.string().trim().min(1).max(256)),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headerNavPaths = await getStoredHeaderNavPaths();
  return NextResponse.json({ headerNavPaths });
}

export async function PATCH(req: Request) {
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

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid header settings", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const headerNavPaths = await updateHeaderNavPaths(parsed.data.headerNavPaths);
  return NextResponse.json({ headerNavPaths });
}
