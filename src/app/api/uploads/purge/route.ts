import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import {
  deleteManagedUpload,
  isManagedUploadUrl,
} from "~/server/uploadthing-cleanup";

const bodySchema = z.object({
  url: z.string().url(),
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
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!isManagedUploadUrl(parsed.data.url)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await deleteManagedUpload(parsed.data.url);
  return NextResponse.json({ ok: true });
}
