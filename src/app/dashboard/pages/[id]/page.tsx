import { notFound } from "next/navigation";
import {
  PageEditor,
  type EditablePage,
} from "~/app/dashboard/pages/[id]/page-editor";
import { getImageUrlsForSections, getPageById } from "~/server/pages";
import { listProjects } from "~/server/projects";
import { listTeamMembers } from "~/server/team";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getPageById(id);
  if (!page) notFound();

  const imageUrls = await getImageUrlsForSections(page.sections);
  const [teamMembers, portfolioProjects] = await Promise.all([
    listTeamMembers(),
    listProjects(),
  ]);

  const editable: EditablePage = {
    id: page.id,
    title: page.title,
    slug: page.slug,
    path: page.path,
    status: page.status,
    isSystem: page.isSystem,
    body: page.body,
    sections: page.sections.map((section) => ({
      id: section.id,
      key: section.key,
      label: section.label,
      kind: section.kind,
      content: section.content,
    })),
  };

  return (
    <PageEditor
      page={editable}
      imageUrls={imageUrls}
      teamMembers={teamMembers.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
      }))}
      portfolioProjects={portfolioProjects.map((project) => ({
        id: project.id,
        title: project.title,
        label: project.label,
      }))}
    />
  );
}
