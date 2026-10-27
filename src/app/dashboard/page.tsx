import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileText,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { listContactMessages } from "~/server/contact";
import { listPages } from "~/server/pages";
import { listPosts } from "~/server/posts";
import { listTeamMembers } from "~/server/team";

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = isAdminRole(session?.user.role);
  const [pages, posts, teamMembers, messages] = await Promise.all([
    listPages(),
    listPosts(),
    listTeamMembers(),
    isAdmin ? listContactMessages() : Promise.resolve([]),
  ]);

  const publishedPages = pages.filter((page) => page.status === "published").length;
  const draftPosts = posts.filter((post) => post.status === "draft").length;
  const newMessages = messages.filter((message) => message.status === "new").length;
  const displayName = session?.user.name?.trim() || session?.user.email;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Manage pages, blog posts, and team content from here.{" "}
            {isAdmin
              ? "As an admin you can also review messages, users, and the public header."
              : "Use the sidebar to jump to the section you need."}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="sm">
              <Link href="/dashboard/pages/new">
                <Plus className="mr-2 size-4" />
                New page
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/posts/new">
                <Plus className="mr-2 size-4" />
                New post
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages</CardTitle>
            <FileText className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{pages.length}</p>
            <p className="text-muted-foreground text-xs">
              {publishedPages} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts</CardTitle>
            <BookOpen className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{posts.length}</p>
            <p className="text-muted-foreground text-xs">
              {draftPosts} drafts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{teamMembers.length}</p>
            <p className="text-muted-foreground text-xs">Members listed</p>
          </CardContent>
        </Card>
        {isAdmin ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{messages.length}</p>
              <p className="text-muted-foreground text-xs">
                {newMessages} new
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold capitalize">
                {session?.user.role}
              </p>
              <p className="text-muted-foreground text-xs">Dashboard access</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content shortcuts</CardTitle>
            <CardDescription>Jump straight to common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { href: "/dashboard/pages", label: "Manage pages", icon: FileText },
              { href: "/dashboard/posts", label: "Manage posts", icon: BookOpen },
              { href: "/dashboard/team", label: "Manage team", icon: Users },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:bg-muted flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Icon className="text-muted-foreground size-4" />
                    {item.label}
                  </span>
                  <ArrowRight className="text-muted-foreground size-4" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>A quick snapshot of your library.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <span className="text-muted-foreground">Latest page update</span>
              <span className="font-medium">
                {pages[0]?.title ?? "No pages yet"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <span className="text-muted-foreground">Latest post</span>
              <span className="font-medium">
                {posts[0]?.title ?? "No posts yet"}
              </span>
            </div>
            {isAdmin ? (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/dashboard/messages">
                  Open inbox
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
