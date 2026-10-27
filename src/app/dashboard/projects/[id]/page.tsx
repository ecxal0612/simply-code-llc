import { notFound } from "next/navigation";
import { ProjectForm, type EditableProject } from "~/app/dashboard/projects/project-form";
import { getProjectById } from "~/server/projects";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const editable: EditableProject = {
    id: project.id,
    title: project.title,
    description: project.description,
    label: project.label,
    projectDate: project.projectDate,
    imageUrl: project.imageUrl,
    links: project.links,
  };

  return <ProjectForm project={editable} />;
}
