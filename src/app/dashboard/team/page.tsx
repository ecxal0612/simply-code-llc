import Link from "next/link";
import { Pencil, Plus, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import { ensurePagesSeeded } from "~/server/pages";
import { listTeamMembers } from "~/server/team";
import { DeleteTeamMemberButton } from "~/app/dashboard/team/delete-team-member-button";
import { TeamMemberAvatar } from "~/app/dashboard/team/team-member-avatar";

export default async function DashboardTeamPage() {
  await ensurePagesSeeded();
  const session = await auth();
  const isAdmin = isAdminRole(session?.user.role);
  const members = await listTeamMembers();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage the people shown in the About Us team section. Team members
            do not get their own public pages.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/team/new">
            <Plus className="mr-2 size-4" />
            Add member
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <p className="font-medium">Team members</p>
          <p className="text-muted-foreground text-xs">
            {members.length} total
          </p>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="bg-muted flex size-12 items-center justify-center rounded-full">
              <Users className="text-muted-foreground size-5" />
            </div>
            <div>
              <p className="font-medium">No team members yet</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Add your first member, then select them in the About Us team
                section.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/dashboard/team/new">
                <Plus className="mr-1.5 size-3.5" />
                Add member
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <TeamMemberAvatar
                    name={member.name}
                    imageUrl={member.imageUrl}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{member.name}</p>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {member.role || "No role set"}
                    </p>
                    {member.technologies.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {member.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="text-muted-foreground rounded-full border px-2 py-0.5 text-[11px]"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm">
                    <Link href={`/dashboard/team/${member.id}`}>
                      <Pencil className="mr-1.5 size-3.5" />
                      Edit
                    </Link>
                  </Button>
                  {isAdmin ? (
                    <DeleteTeamMemberButton
                      memberId={member.id}
                      name={member.name}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
