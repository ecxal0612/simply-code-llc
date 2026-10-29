import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import { updateProjectSchema } from "~/lib/projects/schema";
import { deleteProject, getProjectById, updateProject } from "~/server/projects";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const parsed = updateProjectSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid project data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id } = await params;
  const project = await updateProject(id, {
    title: parsed.data.title,
    description:
      parsed.data.description === undefined ? undefined : parsed.data.description,
    label: parsed.data.label === undefined ? undefined : parsed.data.label,
    projectDate:
      parsed.data.projectDate === undefined ? undefined : parsed.data.projectDate,
    imageUrl:
      parsed.data.imageUrl === undefined
        ? undefined
        : parsed.data.imageUrl === "" || parsed.data.imageUrl === null
          ? null
          : parsed.data.imageUrl,
    links: parsed.data.links,
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const deleted = await deleteProject(id);
  if (!deleted) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
