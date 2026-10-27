import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "~/components/site/page-hero";
import { RichText } from "~/components/site/rich-text";
import { SiteLayout } from "~/components/site/site-layout";
import { getPageForViewer, type PageSearchParams } from "~/server/page-preview";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: PageSearchParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageForViewer(`/${slug}`, searchParams);
  if (!page) return { title: "Page not found | Simply Code LLC" };
  return { title: `${page.title} | Simply Code LLC` };
}

export default async function CustomPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: PageSearchParams;
}) {
  const { slug } = await params;
  const page = await getPageForViewer(`/${slug}`, searchParams);
  if (!page) notFound();

  return (
    <SiteLayout>
      <PageHero eyebrow="SIMPLY CODE" title={page.title} />
      <section className="mx-auto max-w-4xl px-6 py-16">
        {page.body ? (
          <RichText html={page.body} className="text-zinc-400" />
        ) : (
          <p className="text-zinc-400">This page does not have content yet.</p>
        )}
      </section>
    </SiteLayout>
  );
}
