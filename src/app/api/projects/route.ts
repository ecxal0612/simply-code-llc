import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { projectInputSchema } from "~/lib/projects/schema";
import { createProject, listProjects } from "~/server/projects";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await listProjects();
  return NextResponse.json({ projects });
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

  const parsed = projectInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid project data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const project = await createProject({
    title: parsed.data.title,
    description: parsed.data.description,
    label: parsed.data.label,
    projectDate: parsed.data.projectDate,
    imageUrl: parsed.data.imageUrl || null,
    links: parsed.data.links,
  });

  return NextResponse.json({ project });
}
