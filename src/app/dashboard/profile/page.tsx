import {
  Check,
  Mail,
  Minus,
  Shield,
  UserRound,
} from "lucide-react";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() || email?.trim() || "?";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type PermissionRow = {
  area: string;
  admin: string;
  user: string;
};

const permissionRows: PermissionRow[] = [
  {
    area: "Pages & posts",
    admin: "Create, view, edit, and delete",
    user: "Create, view, and edit (delete posts only)",
  },
  {
    area: "Team members",
    admin: "Create, edit, and delete",
    user: "Create and edit",
  },
  {
    area: "Contact inbox",
    admin: "Full access",
    user: "Not available",
  },
  {
    area: "Users",
    admin: "View all users and change roles",
    user: "Not available",
  },
  {
    area: "Site header",
    admin: "Full access (logo and navigation)",
    user: "Full access (logo and navigation)",
  },
  {
    area: "Projects",
    admin: "Create, view, edit, and delete",
    user: "Create, view, and edit",
  },
];

function PermissionValue({
  text,
  allowed,
}: {
  text: string;
  allowed: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        allowed ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {allowed ? (
        <Check className="size-3.5 text-emerald-600" />
      ) : (
        <Minus className="size-3.5" />
      )}
      {text}
    </span>
  );
}

export default async function DashboardProfilePage() {
  const session = await auth();
  const isAdmin = isAdminRole(session?.user.role);
  const displayName = session?.user.name?.trim() || "No name set";
  const email = session?.user.email ?? "—";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your dashboard account and access level.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="overflow-hidden">
          <div className="bg-muted/40 border-b px-6 py-8">
            <div className="flex flex-wrap items-center gap-5">
              <div className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-full text-xl font-semibold">
                {getInitials(session?.user.name, session?.user.email)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold">{displayName}</p>
                <p className="text-muted-foreground mt-1 truncate text-sm">
                  {email}
                </p>
                <span
                  className={
                    isAdmin
                      ? "mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300"
                      : "mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300"
                  }
                >
                  <Shield className="size-3.5" />
                  {isAdmin ? "Administrator" : "Editor"}
                </span>
              </div>
            </div>
          </div>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>
              Information tied to your signed-in session.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                <UserRound className="size-3.5" />
                Display name
              </div>
              <p className="text-sm font-medium">{displayName}</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                <Mail className="size-3.5" />
                Email
              </div>
              <p className="text-sm font-medium break-all">{email}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                {isAdmin
                  ? "Your administrator access across the dashboard."
                  : "What you can do with the editor role."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {permissionRows.map((row) => {
                const value = isAdmin ? row.admin : row.user;
                const allowed = !value.toLowerCase().includes("not available");
                return (
                  <div
                    key={row.area}
                    className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-muted-foreground">{row.area}</span>
                    <PermissionValue text={value} allowed={allowed} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role comparison</CardTitle>
              <CardDescription>
                Quick reference for admin vs editor capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="grid grid-cols-[1fr_auto] gap-2 rounded-lg border p-3 font-medium">
                <span>Area</span>
                <span>Admin / Editor</span>
              </div>
              {permissionRows.map((row) => (
                <div
                  key={`cmp-${row.area}`}
                  className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[minmax(0,0.9fr)_1fr_1fr]"
                >
                  <span className="text-muted-foreground font-medium">
                    {row.area}
                  </span>
                  <span>{row.admin}</span>
                  <span className="text-muted-foreground">{row.user}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need a change?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Profile fields such as name and email are managed through your
              sign-in provider or account setup. Contact an administrator if you
              need a different role.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
