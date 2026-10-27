import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { SiteLayout } from "~/components/site/site-layout";
import { PageHero } from "~/components/site/page-hero";
import { CtaSection } from "~/components/site/cta-section";
import { RichText } from "~/components/site/rich-text";
import { Button } from "~/components/ui/button";
import { getPageForViewer, type PageSearchParams } from "~/server/page-preview";
import { getTeamMembersByIds } from "~/server/team";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: PageSearchParams;
}): Promise<Metadata> {
  const page = await getPageForViewer("/about", searchParams);
  return {
    title: `${page?.title ?? "About Us"} | Simply Code LLC`,
    description:
      "Meet the team of four developers behind Simply Code LLC and learn how we build modern web solutions.",
  };
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const page = await getPageForViewer("/about", searchParams);
  if (!page) notFound();

  const section = (key: string) =>
    page.sections.find((item) => item.key === key)?.content;
  const hero = section("hero") ?? {};
  const who = section("who-we-are") ?? {};
  const team = section("team") ?? {};
  const why = section("why") ?? {};
  const cta = section("cta") ?? {};
  const teamMemberIds = (team.items ?? [])
    .map((item) => item.memberId)
    .filter((memberId): memberId is string => Boolean(memberId));
  const teamMembers = await getTeamMembersByIds(teamMemberIds);

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
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
              {who.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              {who.title}
            </h2>
            <RichText html={who.bodyHtml} className="mt-6 text-zinc-400" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {(who.items ?? []).map((item) => {
              const [firstSentence, ...rest] = (item.description ?? "").split(
                ". ",
              );
              return (
                <div key={item.title} className="border border-white/10 p-6">
                  <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
                    {item.title}
                  </p>
                  {item.meta ? (
                    <p className="mt-2 text-xs text-zinc-500">{item.meta}</p>
                  ) : null}
                  <h3 className="mt-4 text-xl font-semibold">
                    {firstSentence}
                    {firstSentence ? "." : ""}
                  </h3>
                  {rest.length > 0 ? (
                    <RichText
                      html={`<p>${rest.join(". ")}</p>`}
                      className="mt-3 text-sm text-zinc-400"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-4">
              <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
                {team.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                {team.title}
              </h2>
              <RichText html={team.bodyHtml} className="mt-4 text-zinc-400" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              {teamMembers.map((member) => (
                <article
                  key={member.id}
                  className="relative overflow-hidden border border-white/10 p-6"
                >
                  <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-[#1E90FF]/10 blur-3xl" />
                  <div className="relative flex items-start gap-4">
                    {member.imageUrl ? (
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        width={64}
                        height={64}
                        className="size-16 shrink-0 rounded-full border border-white/15 object-cover"
                      />
                    ) : (
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1E90FF]/50 to-transparent font-mono text-sm font-semibold ring-1 ring-white/15">
                        {getInitials(member.name) || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-lg font-medium">{member.name}</h3>
                      {member.role ? (
                        <p className="mt-1 font-mono text-xs tracking-widest text-[#1E90FF] uppercase">
                          {member.role}
                        </p>
                      ) : null}
                      {member.bio ? (
                        <p className="mt-3 text-sm text-zinc-400">
                          {member.bio}
                        </p>
                      ) : null}
                      {member.technologies.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {member.technologies.map((technology) => (
                            <span
                              key={technology}
                              className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-zinc-500 uppercase"
                            >
                              {technology}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
              {why.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              {why.title}
            </h2>
            <RichText html={why.bodyHtml} className="mt-4 text-zinc-400" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {(why.items ?? []).map((item) => (
              <div
                key={item.title}
                className="relative overflow-hidden border border-white/10 p-5"
              >
                <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-[#1E90FF]/10 blur-2xl" />
                <div className="relative">
                  <h3 className="font-medium">{item.title}</h3>
                  {item.meta ? (
                    <p className="mt-1 text-xs text-zinc-500">{item.meta}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        eyebrow={cta.eyebrow}
        title={cta.title ?? "Let's build something meaningful together."}
        descriptionHtml={cta.bodyHtml}
        ctaLabel={cta.ctaLabel ?? "Get in Touch"}
        href={cta.ctaHref ?? "/contact"}
        secondaryCtaLabel={cta.secondaryCtaLabel}
        secondaryCtaHref={cta.secondaryCtaHref}
      />
    </SiteLayout>
  );
}
