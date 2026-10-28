import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { PostsList } from "~/app/dashboard/posts/posts-list";
import { Button } from "~/components/ui/button";
import { listPostsWithAuthors } from "~/server/posts";

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
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/blog" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 size-4" />
              View blog
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/posts/new">
              <Plus className="mr-2 size-4" />
              Create new post
            </Link>
          </Button>
        </div>
      </div>

      <PostsList posts={posts} />
    </div>
  );
}
