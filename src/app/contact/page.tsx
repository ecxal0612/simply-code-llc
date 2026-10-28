import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "~/components/site/contact-form";
import { SiteLayout } from "~/components/site/site-layout";
import { PageHero } from "~/components/site/page-hero";
import { RichText } from "~/components/site/rich-text";
import { Button } from "~/components/ui/button";
import { resolveContactFormContent } from "~/lib/contact/form-content";
import { getPageForViewer, type PageSearchParams } from "~/server/page-preview";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: PageSearchParams;
}): Promise<Metadata> {
  const page = await getPageForViewer("/contact", searchParams);
  return {
    title: `${page?.title ?? "Contact"} | Simply Code LLC`,
    description:
      "Get in touch to discuss your website or web application project.",
  };
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const page = await getPageForViewer("/contact", searchParams);
  if (!page) notFound();

  const section = (key: string) =>
    page.sections.find((item) => item.key === key)?.content;
  const hero = section("hero") ?? {};
  const intro = section("contact-intro") ?? {};
  const contactForm = resolveContactFormContent(intro.contactForm);

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

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
              {intro.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              {intro.title}
            </h2>
            <RichText html={intro.bodyHtml} className="mt-4 text-zinc-400" />
            <div className="mt-10 space-y-6">
              <div>
                <h3 className="text-lg font-medium">
                  Here&apos;s what to expect.
                </h3>
              </div>
              {(intro.items ?? []).map((step, index) => (
                <div
                  key={`${step.title}-${index}`}
                  className="border-l border-white/10 pl-6"
                >
                  <p className="font-mono text-sm text-[#1E90FF]">
                    {step.meta
                      ? `${step.meta}. `
                      : `${String(index + 1).padStart(2, "0")}. `}
                    {step.title}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-zinc-900/40 p-6 md:p-10">
            <ContactForm content={contactForm} />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
