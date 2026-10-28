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
import {
  contactMessageStatusClassName,
  contactMessageStatusLabels,
  getContactMessageListStatus,
} from "~/lib/contact/message-status";
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

const overviewDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

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
  const draftPosts = posts.filter((post) => post.status === "draft");
  const newMessages = messages.filter((message) => message.status === "new").length;
  const displayName = session?.user.name?.trim() || session?.user.email;
  const recentInbox = messages.slice(0, 5);
  const recentDrafts = [...draftPosts]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="dashboard-welcome relative overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="dashboard-welcome-accent pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-10 max-w-2xl space-y-4">
            <p className="text-sm font-medium text-[#1e90ff]">
              Greetings! 👋
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm leading-relaxed text-zinc-500">
              Manage pages, blog posts, and team content from here.{" "}
              {isAdmin
                ? "As an admin you can also review messages, users, and the public header."
                : "Use the sidebar to jump to the section you need."}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size="sm" className="rounded-[10px]">
                <Link href="/dashboard/pages/new">
                  <Plus className="mr-2 size-4" />
                  New page
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-[10px] border-zinc-200 bg-white"
              >
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
            <CardTitle className="text-sm font-medium text-zinc-600">
              Pages
            </CardTitle>
            <span className="dashboard-stat-icon flex size-9 items-center justify-center">
              <FileText className="size-4" />
            </span>
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
            <CardTitle className="text-sm font-medium text-zinc-600">
              Posts
            </CardTitle>
            <span className="dashboard-stat-icon flex size-9 items-center justify-center">
              <BookOpen className="size-4" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{posts.length}</p>
            <p className="text-muted-foreground text-xs">
              {draftPosts.length} drafts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">
              Team
            </CardTitle>
            <span className="dashboard-stat-icon flex size-9 items-center justify-center">
              <Users className="size-4" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{teamMembers.length}</p>
            <p className="text-muted-foreground text-xs">Members listed</p>
          </CardContent>
        </Card>
        {isAdmin ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">
                Messages
              </CardTitle>
              <span className="dashboard-stat-icon flex size-9 items-center justify-center">
                <MessageSquare className="size-4" />
              </span>
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
              <CardTitle className="text-sm font-medium text-zinc-600">
                Your role
              </CardTitle>
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

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Content shortcuts</CardTitle>
            <CardDescription>Jump straight to common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
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
                  className="dashboard-shortcut flex items-center justify-between border bg-white px-4 py-3 text-sm"
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

        <Card className="lg:col-span-2">
          {isAdmin ? (
            <>
              <CardHeader>
                <CardTitle>Contact inbox</CardTitle>
                <CardDescription>
                  Latest submissions from the site contact form.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentInbox.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No messages in the inbox yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {recentInbox.map((message) => {
                      const status = getContactMessageListStatus(message);
                      return (
                        <li key={message.id}>
                          <Link
                            href={`/dashboard/messages/${message.id}`}
                            className="dashboard-shortcut flex items-center gap-3 border bg-white px-4 py-3 text-sm transition-colors hover:border-[#1e90ff]/40"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium text-zinc-900">
                                {message.name}
                              </span>
                              <span className="text-muted-foreground block truncate text-xs">
                                {message.projectType}
                                {" · "}
                                {overviewDateFormatter.format(message.createdAt)}
                              </span>
                            </span>
                            <span className={contactMessageStatusClassName(status)}>
                              {contactMessageStatusLabels[status]}
                            </span>
                            <ArrowRight className="text-muted-foreground size-4 shrink-0" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full rounded-[10px] border-[#1e90ff]/30 text-[#1e90ff] hover:bg-[#1e90ff]/10"
                >
                  <Link href="/dashboard/messages">
                    View all messages
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Draft posts</CardTitle>
                <CardDescription>
                  Pick up where you left off in the blog editor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentDrafts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No drafts right now. Start a new post when you&apos;re ready.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {recentDrafts.map((post) => (
                      <li key={post.id}>
                        <Link
                          href={`/dashboard/posts/${post.id}`}
                          className="dashboard-shortcut flex items-center gap-3 border bg-white px-4 py-3 text-sm transition-colors hover:border-[#1e90ff]/40"
                        >
                          <BookOpen className="text-muted-foreground size-4 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-zinc-900">
                              {post.title}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              Updated{" "}
                              {overviewDateFormatter.format(post.updatedAt)}
                            </span>
                          </span>
                          <ArrowRight className="text-muted-foreground size-4 shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full rounded-[10px] border-[#1e90ff]/30 text-[#1e90ff] hover:bg-[#1e90ff]/10"
                >
                  <Link href="/dashboard/posts">
                    Manage posts
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
