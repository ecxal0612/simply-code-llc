import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { PostFeaturedImage } from "~/components/blog/post-featured-image";
import { CtaSection } from "~/components/site/cta-section";
import { PageHero } from "~/components/site/page-hero";
import { RichText } from "~/components/site/rich-text";
import { SiteLayout } from "~/components/site/site-layout";
import { Button } from "~/components/ui/button";
import { blogListingHref, resolveBlogPostsPerPage } from "~/lib/posts/pagination";
import { postExcerpt } from "~/lib/posts/types";
import { getPageForViewer, type PageSearchParams } from "~/server/page-preview";
import { listPublishedPosts } from "~/server/posts";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function parsePageNumber(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = Array.from(
    new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]),
  )
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const result: Array<number | "ellipsis"> = [];
  let previous = 0;
  for (const page of pages) {
    if (page - previous > 1) result.push("ellipsis");
    result.push(page);
    previous = page;
  }
  return result;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: PageSearchParams;
}): Promise<Metadata> {
  const page = await getPageForViewer("/blog", searchParams);
  return {
    title: `${page?.title ?? "Blog"} | Simply Code LLC`,
    description:
      "Insights, updates and articles from the Simply Code LLC team.",
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const cmsPage = await getPageForViewer("/blog", resolvedSearchParams);
  if (!cmsPage) notFound();

  const requestedPage = parsePageNumber(resolvedSearchParams?.page);
  const section = (key: string) =>
    cmsPage.sections.find((item) => item.key === key)?.content;
  const postsSection = section("posts") ?? {};

  const pageSize = resolveBlogPostsPerPage(postsSection.postsPerPage);
  const listing = await listPublishedPosts({
    page: requestedPage,
    pageSize,
  });

  const hero = section("hero") ?? {};
  const cta = section("cta") ?? {};
  const visiblePages = getVisiblePages(listing.page, listing.totalPages);

  return (
    <SiteLayout>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title ?? cmsPage.title}
        descriptionHtml={hero.bodyHtml}
      >
        {hero.ctaLabel ? (
          <Button asChild size="lg" className="rounded-none px-8">
            <Link href={hero.ctaHref ?? "/contact"}>
              {hero.ctaLabel}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        ) : null}
        {hero.secondaryCtaLabel ? (
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-none border-zinc-600 bg-transparent text-zinc-100 hover:bg-white/5"
          >
            <Link href={hero.secondaryCtaHref ?? "/work"}>
              {hero.secondaryCtaLabel}
            </Link>
          </Button>
        ) : null}
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div>
          {postsSection.eyebrow ? (
            <p className="mb-2 font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
              {postsSection.eyebrow}
            </p>
          ) : null}
          <h2 className="text-2xl font-semibold tracking-tight">
            {postsSection.title ?? "Latest posts"}
          </h2>
          <RichText
            html={postsSection.bodyHtml}
            className="mt-3 max-w-2xl text-zinc-400"
          />
        </div>

        {listing.posts.length === 0 ? (
          <div className="mt-8 border border-white/10 p-10 text-center">
            <p className="font-medium">No posts published yet.</p>
            <p className="mt-2 text-sm text-zinc-400">
              Check back soon for new articles and updates.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listing.posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col border border-white/10"
              >
                <PostFeaturedImage
                  src={post.featuredImageUrl}
                  alt={post.title}
                />
                <div className="flex flex-1 flex-col space-y-3 p-6">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <time dateTime={post.createdAt.toISOString()}>
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
                  </div>
                  <h3 className="text-lg font-medium">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="transition-colors hover:text-[#1E90FF]"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {postExcerpt(post.body)}
                  </p>
                  <Button
                    asChild
                    variant="link"
                    className="mt-auto justify-start px-0 text-zinc-100"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      Read more
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        {listing.totalPages > 1 ? (
          <nav
            aria-label="Blog pagination"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            {listing.page > 1 ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-none border-zinc-700"
              >
                <Link
                  href={blogListingHref(listing.page - 1)}
                >
                  Previous
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="rounded-none border-zinc-700"
                disabled
              >
                Previous
              </Button>
            )}

            {visiblePages.map((page, index) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-sm text-zinc-500"
                >
                  …
                </span>
              ) : (
                <Button
                  key={page}
                  asChild
                  size="sm"
                  variant={page === listing.page ? "default" : "outline"}
                  className="rounded-none"
                >
                  <Link
                    href={blogListingHref(page)}
                    aria-current={page === listing.page ? "page" : undefined}
                  >
                    {page}
                  </Link>
                </Button>
              ),
            )}

            {listing.page < listing.totalPages ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-none border-zinc-700"
              >
                <Link
                  href={blogListingHref(listing.page + 1)}
                >
                  Next
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="rounded-none border-zinc-700"
                disabled
              >
                Next
              </Button>
            )}
          </nav>
        ) : null}
      </section>

      <CtaSection
        eyebrow={cta.eyebrow}
        title={cta.title ?? "Your project could be our next collaboration."}
        descriptionHtml={cta.bodyHtml}
        ctaLabel={cta.ctaLabel ?? "Start Your Project"}
        href={cta.ctaHref ?? "/contact"}
        secondaryCtaLabel={cta.secondaryCtaLabel}
        secondaryCtaHref={cta.secondaryCtaHref}
      />
    </SiteLayout>
  );
}
