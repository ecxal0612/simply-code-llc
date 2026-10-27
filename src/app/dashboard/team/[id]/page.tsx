import { notFound } from "next/navigation";
import { TeamMemberForm } from "~/app/dashboard/team/team-member-form";
import { getTeamMemberById } from "~/server/team";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getTeamMemberById(id);
  if (!member) notFound();

  return (
    <TeamMemberForm
      member={{
        id: member.id,
        name: member.name,
        role: member.role,
        bio: member.bio,
        imageUrl: member.imageUrl,
        technologies: member.technologies,
      }}
    />
  );
}
