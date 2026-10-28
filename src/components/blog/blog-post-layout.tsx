import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PostFeaturedImage } from "~/components/blog/post-featured-image";
import { RichText } from "~/components/site/rich-text";
import { Button } from "~/components/ui/button";
import { formatReadingTime, postExcerpt } from "~/lib/posts/types";
import type { PostRecord } from "~/server/posts";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

type BlogPostLayoutProps = {
  post: PostRecord;
  relatedPosts: PostRecord[];
};

export function BlogPostLayout({ post, relatedPosts }: BlogPostLayoutProps) {
  const readingTime = formatReadingTime(post.body);
  const categoriesLabel =
    post.categories.length > 0 ? post.categories.join(", ") : "Article";
  const relatedCategoryLabel = post.categories[0];

  return (
    <>
      <article>
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-16 md:pt-14 md:pb-20">
          <header className="grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-x-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-14">
            <div className="flex items-start md:pt-1">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                <ArrowLeft className="size-4 shrink-0" />
                Back to blog
              </Link>
            </div>

            <div className="min-w-0 text-left">
              <h1 className="text-4xl leading-[1.12] font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-[3.25rem]">
                {post.title}
              </h1>

              {post.status === "draft" ? (
                <span className="mt-4 inline-block rounded-[18px] border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                  Draft preview
                </span>
              ) : null}

              <div className="mt-8 flex flex-wrap items-start gap-x-10 gap-y-6 border-t border-white/10 pt-8 sm:gap-x-14">
                <div className="min-w-[7rem]">
                  <p className="text-xs font-medium text-zinc-500">
                    Reading time
                  </p>
                  <p className="mt-2 text-sm font-medium text-zinc-100">
                    {readingTime}
                  </p>
                </div>

                <div className="min-w-[7rem]">
                  <p className="text-xs font-medium text-zinc-500">Category</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">
                    {categoriesLabel}
                  </p>
                </div>

                <div className="min-w-[7rem]">
                  <p className="text-xs font-medium text-zinc-500">Date</p>
                  <p className="mt-2 text-sm font-medium text-zinc-100">
                    <time dateTime={post.createdAt.toISOString()}>
                      {dateFormatter.format(post.createdAt)}
                    </time>
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-10 md:mt-12">
            {post.featuredImageUrl ? (
              <PostFeaturedImage
                src={post.featuredImageUrl}
                alt={post.title}
                className="w-full overflow-hidden rounded-[18px] border border-white/10"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            ) : null}

            <div
              className={
                post.featuredImageUrl ? "mt-12 w-full md:mt-14" : "w-full"
              }
            >
              {post.body ? (
                <RichText
                  html={post.body}
                  className="blog-post-prose w-full text-[1.0625rem] leading-[1.85] text-zinc-300"
                />
              ) : (
                <p className="text-zinc-400">
                  This post does not have content yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {relatedPosts.length > 0 ? (
          <section className="border-t border-white/10 bg-zinc-950/30">
            <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
              <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
                Related
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                Posts in this category
              </h2>
              {relatedCategoryLabel ? (
                <p className="mt-2 text-sm text-zinc-500">
                  More published posts related to{" "}
                  <span className="font-semibold text-zinc-300">
                    {relatedCategoryLabel}
                  </span>
                  .
                </p>
              ) : null}
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related) => (
                  <article
                    key={related.id}
                    className="group flex flex-col overflow-hidden rounded-[16px] border border-white/10 bg-zinc-950/50 transition-colors hover:border-[#1E90FF]/40"
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
                        {related.categories.map((category) => (
                          <span
                            key={category}
                            className="rounded-[18px] border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-zinc-300"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      <h3 className="mt-4 text-lg font-medium leading-snug">
                        <Link
                          href={`/blog/${related.slug}`}
                          className="transition-colors group-hover:text-[#1E90FF]"
                        >
                          {related.title}
                        </Link>
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
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
      </article>
    </>
  );
}
