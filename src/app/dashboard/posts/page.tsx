import Link from "next/link";
import { ExternalLink, Eye, Pencil, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DeletePostButton } from "~/app/dashboard/posts/delete-post-button";
import { listPostsWithAuthors } from "~/server/posts";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function DashboardPostsPage() {
  const posts = await listPostsWithAuthors();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Posts</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Blog posts stored in the database. Drafts stay hidden from the
            public blog until you publish them.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/posts/new">
            <Plus className="mr-2 size-4" />
            Create new post
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <p className="font-medium">All posts</p>
          <p className="text-muted-foreground text-xs">{posts.length} total</p>
        </div>
        {posts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">No posts yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Create your first post to start publishing on the blog.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/posts/new">
                <Plus className="mr-2 size-4" />
                Create new post
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{post.title}</p>
                    <span
                      className={
                        post.status === "published"
                          ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600"
                          : "rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600"
                      }
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 font-mono text-xs">
                    /blog/{post.slug}
                  </p>
                  {post.categories.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {post.categories.map((category) => (
                        <span
                          key={category}
                          className="bg-muted rounded-full px-2 py-0.5 text-[11px]"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="text-muted-foreground mt-1 text-xs">
                    By{" "}
                    {post.authorName?.trim() ||
                      post.authorEmail ||
                      "Unknown author"}
                    {" · "}
                    Updated {dateFormatter.format(post.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {post.status === "draft" ? (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/blog/${post.slug}?preview=1`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Eye className="mr-1.5 size-3.5" />
                        Preview
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="mr-1.5 size-3.5" />
                        View
                      </Link>
                    </Button>
                  )}
                  <Button asChild size="sm">
                    <Link href={`/dashboard/posts/${post.id}`}>
                      <Pencil className="mr-1.5 size-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <DeletePostButton postId={post.id} title={post.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
