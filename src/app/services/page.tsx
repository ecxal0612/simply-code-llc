import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { SiteLayout } from "~/components/site/site-layout";
import { PageHero } from "~/components/site/page-hero";
import { CtaSection } from "~/components/site/cta-section";
import { RichText } from "~/components/site/rich-text";
import { Button } from "~/components/ui/button";
import type { PageSectionItem } from "~/lib/pages/types";
import { getPageForViewer, type PageSearchParams } from "~/server/page-preview";

function ServiceFeatureItems({ items }: { items: PageSectionItem[] }) {
  return (
    <>
      {items.map((item, index) => (
        <div
          key={`${item.title}-${index}`}
          className="border border-white/10 p-5 text-sm text-zinc-400"
        >
          {item.meta ? (
            <p className="font-mono text-[11px] tracking-[0.25em] text-[#1E90FF] uppercase">
              {item.meta}
            </p>
          ) : null}
          <p className="font-medium text-zinc-100">{item.title}</p>
          {item.description ? <p className="mt-2">{item.description}</p> : null}
        </div>
      ))}
    </>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: PageSearchParams;
}): Promise<Metadata> {
  const page = await getPageForViewer("/services", searchParams);
  return {
    title: `${page?.title ?? "Services"} | Simply Code LLC`,
    description:
      "Full-stack development services for websites, web applications, APIs, performance and deployment.",
  };
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const page = await getPageForViewer("/services", searchParams);
  if (!page) notFound();

  const section = (key: string) =>
    page.sections.find((item) => item.key === key)?.content;
  const hero = section("hero") ?? {};
  const intro = section("custom-website-development") ?? {};
  const performance = section("performance") ?? {};
  const deployment = section("deployment") ?? {};
  const technology = section("technology") ?? {};
  const cta = section("cta") ?? {};

  return (
    <SiteLayout>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title ?? page.title}
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
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
              {intro.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              {intro.title}
            </h2>
            <RichText html={intro.bodyHtml} className="mt-4 text-zinc-400" />
          </div>
          <div className="border border-white/10 p-6">
            <p className="font-mono text-xs tracking-[0.3em] text-zinc-500 uppercase">
              What we deliver
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
              {(intro.items ?? []).map((item, index) => (
                <li
                  key={`${item.title}-${index}`}
                  className="border-b border-white/10 pb-2"
                >
                  <p>{item.title}</p>
                  {item.meta ? (
                    <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-[#1E90FF] uppercase">
                      {item.meta}
                    </p>
                  ) : null}
                  {item.description ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      {item.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
              {performance.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              {performance.title}
            </h2>
            <RichText
              html={performance.bodyHtml}
              className="mt-4 text-zinc-400"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            <ServiceFeatureItems items={performance.items ?? []} />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
                {deployment.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                {deployment.title}
              </h2>
              <RichText
                html={deployment.bodyHtml}
                className="mt-4 text-zinc-400"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              <ServiceFeatureItems items={deployment.items ?? []} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
                {technology.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                {technology.title}
              </h2>
              <RichText
                html={technology.bodyHtml}
                className="mt-4 text-zinc-400"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              <ServiceFeatureItems items={technology.items ?? []} />
            </div>
          </div>
        </div>
      </section>

      <CtaSection
        eyebrow={cta.eyebrow}
        title={cta.title ?? "Have a project in mind?"}
        descriptionHtml={cta.bodyHtml}
        ctaLabel={cta.ctaLabel ?? "Tell Us About Your Project."}
        href={cta.ctaHref ?? "/contact"}
        secondaryCtaLabel={cta.secondaryCtaLabel}
        secondaryCtaHref={cta.secondaryCtaHref}
      />
    </SiteLayout>
  );
}
