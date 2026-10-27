import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PostFeaturedImage } from "~/components/blog/post-featured-image";
import { SiteLayout } from "~/components/site/site-layout";
import { RichText } from "~/components/site/rich-text";
import { Button } from "~/components/ui/button";
import { postExcerpt } from "~/lib/posts/types";
import { getPostForViewer, type PostSearchParams } from "~/server/post-preview";
import { getRelatedPosts } from "~/server/posts";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: PostSearchParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostForViewer(slug, searchParams);
  if (!post) return { title: "Post not found | Simply Code LLC" };

  return {
    title: `${post.title} | Simply Code LLC`,
    description: postExcerpt(post.body, 160),
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: PostSearchParams;
}) {
  const { slug } = await params;
  const post = await getPostForViewer(slug, searchParams);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post);

  return (
    <SiteLayout>
      <article>
        <header className="border-b border-white/10">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="-ml-2 text-zinc-400 hover:text-zinc-100"
            >
              <Link href="/blog">
                <ArrowLeft className="mr-1.5 size-3.5" />
                Back to blog
              </Link>
            </Button>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <time dateTime={post.createdAt.toISOString()}>
                {post.status === "published" ? "Published" : "Created"}{" "}
                {dateFormatter.format(post.createdAt)}
              </time>
              {post.categories.map((category) => (
                <span
                  key={category}
                  className="border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400"
                >
                  {category}
                </span>
              ))}
              {post.status === "draft" ? (
                <span className="bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                  Draft preview
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
              {post.title}
            </h1>

            <PostFeaturedImage
              src={post.featuredImageUrl}
              alt={post.title}
              className="mt-10 border border-white/10"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
        </header>

        <section className="mx-auto max-w-3xl px-6 py-16">
          {post.body ? (
            <RichText html={post.body} className="text-zinc-300" />
          ) : (
            <p className="text-zinc-400">
              This post does not have content yet.
            </p>
          )}
        </section>
      </article>

      {relatedPosts.length > 0 ? (
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
              Keep reading
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Related posts
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <article
                  key={related.id}
                  className="flex flex-col border border-white/10"
                >
                  <PostFeaturedImage
                    src={related.featuredImageUrl}
                    alt={related.title}
                  />
                  <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <time dateTime={related.createdAt.toISOString()}>
                      {dateFormatter.format(related.createdAt)}
                    </time>
                    {related.categories.slice(0, 2).map((category) => (
                      <span
                        key={category}
                        className="border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-4 text-lg font-medium">
                    <Link
                      href={`/blog/${related.slug}`}
                      className="transition-colors hover:text-[#1E90FF]"
                    >
                      {related.title}
                    </Link>
                  </h3>
                  <p className="mt-3 flex-1 text-sm text-zinc-400">
                    {postExcerpt(related.body, 140)}
                  </p>
                  <Button
                    asChild
                    variant="link"
                    className="mt-5 justify-start px-0 text-zinc-100"
                  >
                    <Link href={`/blog/${related.slug}`}>
                      Read more
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}
