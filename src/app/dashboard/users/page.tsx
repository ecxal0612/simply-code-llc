import Link from "next/link";
import { Shield, UserCog, Users } from "lucide-react";
import { auth } from "~/lib/auth";
import { RestoreDashboardAccessButton } from "~/app/dashboard/users/restore-dashboard-access-button";
import { RevokeDashboardAccessButton } from "~/app/dashboard/users/revoke-dashboard-access-button";
import { UserRoleSelect } from "~/app/dashboard/users/user-role-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { listUsers } from "~/server/users";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function getInitials(name: string | null, email: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function DashboardUsersPage() {
  const session = await auth();
  const users = await listUsers();
  const adminCount = users.filter((user) => user.role === "admin").length;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-500/10 via-background to-background p-6 sm:p-8">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
              Administration
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">Users</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Manage who can access the dashboard. Promote trusted accounts to
              admin or keep them as editors with limited permissions.
            </p>
          </div>
          <div className="bg-background/80 flex size-14 items-center justify-center rounded-xl border shadow-sm">
            <UserCog className="text-primary size-7" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total accounts</CardDescription>
            <CardTitle className="text-2xl">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Administrators</CardDescription>
            <CardTitle className="text-2xl">{adminCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Editors</CardDescription>
            <CardTitle className="text-2xl">{users.length - adminCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            All users
          </CardTitle>
          <CardDescription>
            Change roles with the dropdown. You cannot remove your own admin
            access.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {users.map((user) => {
            const isSelf = user.id === session?.user?.id;
            const isAdmin = user.role === "admin";
            const accessRevoked = Boolean(user.dashboardAccessRevokedAt);
            return (
              <div
                key={user.id}
                className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={
                      isAdmin
                        ? "bg-violet-500/15 text-violet-700 dark:text-violet-300 flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                        : "bg-muted text-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    }
                  >
                    {getInitials(user.name, user.email)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {user.name?.trim() || "No name"}
                      {isSelf ? (
                        <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                          (you)
                        </span>
                      ) : null}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                      {user.email ?? "—"}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Joined {dateFormatter.format(user.createdAt)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={
                          isAdmin
                            ? "inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:text-violet-300"
                            : "inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:text-sky-300"
                        }
                      >
                        <Shield className="size-3" />
                        {isAdmin ? "Admin" : "Editor"}
                      </span>
                      {accessRevoked ? (
                        <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:text-red-300">
                          Access removed
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <UserRoleSelect
                    userId={user.id}
                    value={user.role}
                    disabled={isSelf || accessRevoked}
                  />
                  {accessRevoked ? (
                    <RestoreDashboardAccessButton
                      userId={user.id}
                      userLabel={user.name?.trim() || user.email || "This user"}
                    />
                  ) : (
                    <RevokeDashboardAccessButton
                      userId={user.id}
                      userLabel={user.name?.trim() || user.email || "This user"}
                      disabled={isSelf}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-center text-xs">
        Role details are documented on your{" "}
        <Link href="/dashboard/profile" className="text-primary underline-offset-4 hover:underline">
          profile page
        </Link>
        .
      </p>
    </div>
  );
}
