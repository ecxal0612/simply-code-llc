import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { SiteLayout } from "~/components/site/site-layout";
import { PageHero } from "~/components/site/page-hero";
import { CtaSection } from "~/components/site/cta-section";
import { RichText } from "~/components/site/rich-text";
import { Button } from "~/components/ui/button";
import { getPageForViewer, type PageSearchParams } from "~/server/page-preview";
import {
  resolveProjectSectionItem,
  type ProjectSource,
} from "~/lib/projects/display";
import { getImageUrlsForSections } from "~/server/pages";
import { getProjectsMapForPageSections } from "~/server/projects";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: PageSearchParams;
}): Promise<Metadata> {
  const page = await getPageForViewer("/work", searchParams);
  return {
    title: `${page?.title ?? "Our Work"} | Simply Code LLC`,
    description:
      "Portfolio and experience developing websites for Zoom and selected projects.",
  };
}

export default async function WorkPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const page = await getPageForViewer("/work", searchParams);
  if (!page) notFound();

  const [imageUrls, projectsById] = await Promise.all([
    getImageUrlsForSections(page.sections),
    getProjectsMapForPageSections(page.sections),
  ]);
  const projectSources = new Map<string, ProjectSource>(
    [...projectsById.entries()].map(([id, project]) => [
      id,
      {
        id: project.id,
        title: project.title,
        description: project.description,
        label: project.label,
        projectDate: project.projectDate,
        imageUrl: project.imageUrl,
        links: project.links,
      },
    ]),
  );
  const section = (key: string) =>
    page.sections.find((item) => item.key === key)?.content;
  const hero = section("hero") ?? {};
  const experience = section("experience") ?? {};
  const projects = section("projects") ?? {};
  const testimonials = section("testimonials") ?? {};
  const cta = section("cta") ?? {};
  const experienceImage = imageUrls["work.experience"];

  return (
    <SiteLayout>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title ?? page.title}
        descriptionHtml={hero.bodyHtml}
      >
        {hero.ctaLabel ? (
          <Button asChild size="lg" className="rounded-[10px] px-8">
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
            className="rounded-[10px] border-zinc-600 bg-transparent text-zinc-100 hover:bg-white/5"
          >
            <Link href={hero.secondaryCtaHref ?? "/work"}>
              {hero.secondaryCtaLabel}
            </Link>
          </Button>
        ) : null}
      </PageHero>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
                {experience.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                {experience.title}
              </h2>
              <RichText
                html={experience.bodyHtml}
                className="mt-4 text-zinc-400"
              />
            </div>
            <div className="relative min-h-[240px] overflow-hidden rounded-[18px] border border-white/10 lg:col-span-7">
              {experienceImage ? (
                <Image
                  src={experienceImage}
                  alt={experience.images?.[0]?.alt ?? ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
            {projects.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            {projects.title}
          </h2>
          <RichText
            html={projects.bodyHtml}
            className="mt-3 max-w-2xl text-zinc-400"
          />
          <div className="mt-10 space-y-6">
            {(projects.items ?? [])
              .map((item, index) =>
                resolveProjectSectionItem(item, index, projectSources),
              )
              .filter((item): item is NonNullable<typeof item> => Boolean(item))
              .map((item) => (
                <article
                  key={item.key}
                  className="grid gap-6 rounded-[18px] border border-white/10 p-6 md:grid-cols-[minmax(0,1fr)_240px] md:items-center"
                >
                  <div>
                    <p className="font-mono text-xs tracking-[0.3em] text-zinc-500 uppercase">
                      {item.meta}
                    </p>
                    <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                    <RichText
                      html={
                        item.description
                          ? `<p>${item.description}</p>`
                          : undefined
                      }
                      className="mt-2 text-sm text-zinc-400"
                    />
                    <Button
                      asChild
                      variant="outline"
                      className="mt-6 w-fit rounded-[10px] border-zinc-600 text-zinc-100"
                    >
                      <Link href={item.href}>{item.linkLabel}</Link>
                    </Button>
                  </div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] border border-white/10 bg-gradient-to-br from-[#1E90FF]/20 to-transparent md:aspect-auto md:h-44 md:w-60">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="240px"
                      />
                    ) : null}
                  </div>
                </article>
              ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
                {testimonials.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                {testimonials.title}
              </h2>
              <RichText
                html={testimonials.bodyHtml}
                className="mt-3 max-w-xl text-zinc-400"
              />
            </div>
          </div>
          <div className="-mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
            {(testimonials.items ?? []).map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="min-w-[280px] snap-start rounded-[18px] border border-white/10 p-6 md:min-w-0"
              >
                <p className="text-sm text-zinc-400">
                  &ldquo;{item.description}&rdquo;
                </p>
                <p className="mt-6 font-medium">{item.title}</p>
                <p className="text-sm text-zinc-500">{item.meta}</p>
              </article>
            ))}
          </div>
        </div>
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
