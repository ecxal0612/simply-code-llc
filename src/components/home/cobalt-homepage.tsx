import Image from "next/image";
import { ArrowUpRight, LayoutGrid, Users } from "lucide-react";
import { CobaltSiteFooter } from "~/components/home/cobalt-site-footer";
import { HeroParticleField } from "~/components/home/hero-particle-field";
import { SiteHeader } from "~/components/site/site-header";
import { HomeNavigationEffects } from "~/components/home/home-navigation-effects";
import { RichText } from "~/components/site/rich-text";
import { Button } from "~/components/ui/button";
import { cobaltClass } from "~/lib/home/cobalt-theme";
import type { PageSectionContent } from "~/lib/pages/types";
import {
  resolveProjectSectionItem,
  type ProjectSource,
} from "~/lib/projects/display";
import type { PageWithSections } from "~/server/pages";
import type { ProjectRecord } from "~/server/projects";
import { cn } from "~/lib/utils";

function toProjectSource(project: ProjectRecord): ProjectSource {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    label: project.label,
    projectDate: project.projectDate,
    imageUrl: project.imageUrl,
    links: project.links,
  };
}

export function CobaltHomepage({
  isLoggedIn,
  page,
  images,
  projectsById,
}: {
  isLoggedIn: boolean;
  page: PageWithSections;
  images: Record<string, string>;
  projectsById: Map<string, ProjectRecord>;
}) {
  const projectSources = new Map(
    [...projectsById.entries()].map(([id, project]) => [
      id,
      toProjectSource(project),
    ]),
  );
  const sections = new Map(
    page.sections.map((section) => [section.key, section.content]),
  );
  const section = (key: string): PageSectionContent => sections.get(key) ?? {};
  const imageFor = (content: PageSectionContent, fallbackSlot: string) =>
    images[content.images?.[0]?.slot ?? fallbackSlot] ?? "";

  const hero = section("hero");
  const services = section("services");
  const experience = section("experience");
  const technology = section("technology");
  const team = section("team");
  const process = section("process");
  const projects = section("projects");
  const contact = section("contact");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />

      <HomeNavigationEffects />
      <SiteHeader isLoggedIn={isLoggedIn} />

      <section className="relative flex min-h-[80vh] flex-col justify-end overflow-hidden">
        <Image
          src={imageFor(hero, "home.hero")}
          alt={hero.images?.[0]?.alt ?? ""}
          fill
          className="object-cover opacity-25"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/30" />
        <HeroParticleField className="z-[3]" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 pb-16 md:pt-40 md:pb-20">
          <p
            className={cn(
              "font-mono text-xs tracking-[0.35em] uppercase",
              cobaltClass.eyebrow,
            )}
          >
            {hero.eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <RichText
            html={hero.bodyHtml}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400"
          />
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {hero.ctaLabel ? (
              <Button
                asChild
                size="lg"
                className={cn("h-11 rounded-none px-7", cobaltClass.btn)}
              >
                <a href={hero.ctaHref ?? "#contact"}>
                  {hero.ctaLabel}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            ) : null}
            {hero.secondaryCtaLabel ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 rounded-none border-zinc-600 bg-transparent text-zinc-100 hover:bg-white/5"
              >
                <a href={hero.secondaryCtaHref ?? "#services"}>
                  {hero.secondaryCtaLabel}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p
              className={cn(
                "font-mono text-xs tracking-[0.3em] uppercase",
                cobaltClass.eyebrowStrong,
              )}
            >
              {services.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              {services.title}
            </h2>
            <RichText html={services.bodyHtml} className="mt-4 text-zinc-400" />
            <div className="mt-8 flex flex-wrap gap-3">
              {services.ctaLabel ? (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-none border-zinc-600 text-zinc-100"
                >
                  <a href={services.ctaHref ?? "/services"}>
                    {services.ctaLabel}
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              ) : null}
              {services.secondaryCtaLabel ? (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-none border-zinc-700 text-zinc-300 hover:bg-white/5"
                >
                  <a href={services.secondaryCtaHref ?? "/work"}>
                    {services.secondaryCtaLabel}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {(services.items ?? []).map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="relative overflow-hidden border border-white/10 p-6 transition hover:border-[#1E90FF]/60 hover:bg-white/[0.02]"
              >
                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#1E90FF]/10 blur-3xl" />
                <div className="relative">
                  <LayoutGrid
                    className={cn("mb-4 size-5", cobaltClass.accent)}
                  />
                  {item.meta ? (
                    <p
                      className={cn(
                        "font-mono text-[11px] tracking-[0.25em] uppercase",
                        cobaltClass.accent,
                      )}
                    >
                      {item.meta}
                    </p>
                  ) : null}
                  <h3 className={cn("font-medium", item.meta && "mt-2")}>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="relative overflow-hidden border border-white/10">
          <div className="absolute inset-0">
            <Image
              src={imageFor(experience, "home.experience")}
              alt={experience.images?.[0]?.alt ?? ""}
              fill
              className="object-cover opacity-30"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/70" />
          </div>
          <div className="relative grid gap-8 p-8 md:p-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p
                className={cn(
                  "font-mono text-xs tracking-[0.3em] uppercase",
                  cobaltClass.eyebrowStrong,
                )}
              >
                {experience.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                {experience.title}
              </h2>
              <RichText
                html={experience.bodyHtml}
                className="mt-4 max-w-2xl text-zinc-300"
              />
              <div className="mt-8 flex flex-wrap gap-3">
                {experience.ctaLabel ? (
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-none border-white/40 text-zinc-100 hover:bg-white/5"
                  >
                    <a href={experience.ctaHref ?? "/work"}>
                      {experience.ctaLabel}
                      <ArrowUpRight className="size-4" />
                    </a>
                  </Button>
                ) : null}
                {experience.secondaryCtaLabel ? (
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-none border-white/20 text-zinc-300 hover:bg-white/5"
                  >
                    <a href={experience.secondaryCtaHref ?? "/about"}>
                      {experience.secondaryCtaLabel}
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="hidden lg:col-span-5 lg:flex lg:justify-end">
              <div className="relative h-40 w-full max-w-sm border border-white/15">
                <Image
                  src={imageFor(experience, "home.experience")}
                  alt={experience.images?.[0]?.alt ?? ""}
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={cn("border-y border-white/10", cobaltClass.sectionTech)}
      >
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] text-white/75 uppercase">
                {technology.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                {technology.title}
              </h2>
              <RichText
                html={technology.bodyHtml}
                className="mt-3 max-w-xl text-white/80"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {technology.ctaLabel ? (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-none border-white/40 text-white hover:bg-white/10"
                >
                  <a href={technology.ctaHref ?? "/services"}>
                    {technology.ctaLabel}
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              ) : null}
              {technology.secondaryCtaLabel ? (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-none border-white/20 text-white/80 hover:bg-white/10"
                >
                  <a href={technology.secondaryCtaHref ?? "/work"}>
                    {technology.secondaryCtaLabel}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {(technology.items ?? []).map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="border border-white/30 px-4 py-3 text-white/90"
              >
                {item.meta ? (
                  <p className="font-mono text-[10px] tracking-[0.25em] text-white/60 uppercase">
                    {item.meta}
                  </p>
                ) : null}
                <p className="text-sm">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-xs text-white/70">
                    {item.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col justify-between border border-white/10 p-8">
            <div>
              <p
                className={cn(
                  "font-mono text-xs tracking-[0.3em] uppercase",
                  cobaltClass.eyebrowStrong,
                )}
              >
                {team.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                {team.title}
              </h2>
              <RichText html={team.bodyHtml} className="mt-4 text-zinc-400" />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {team.ctaLabel ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-fit rounded-none border-zinc-600 text-zinc-100"
                >
                  <a href={team.ctaHref ?? "/about"}>
                    {team.ctaLabel}
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              ) : null}
              {team.secondaryCtaLabel ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-fit rounded-none border-zinc-700 text-zinc-300 hover:bg-white/5"
                >
                  <a href={team.secondaryCtaHref ?? "/contact"}>
                    {team.secondaryCtaLabel}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="border border-white/10 p-8">
            <div className="flex items-center gap-3">
              <Users className={cn("size-5", cobaltClass.accent)} />
              <p className="font-medium">
                {team.items?.[0]?.title ?? "Full-stack mindset"}
              </p>
            </div>
            <p className="mt-3 max-w-sm text-sm text-zinc-300">
              {team.items?.[0]?.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4">
            <p
              className={cn(
                "font-mono text-xs tracking-[0.3em] uppercase",
                cobaltClass.eyebrowStrong,
              )}
            >
              {process.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              {process.title}
            </h2>
            <RichText html={process.bodyHtml} className="mt-4 text-zinc-400" />
            <div className="mt-8 flex flex-wrap gap-3">
              {process.ctaLabel ? (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-none border-zinc-600 text-zinc-100"
                >
                  <a href={process.ctaHref ?? "/about"}>
                    {process.ctaLabel}
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              ) : null}
              {process.secondaryCtaLabel ? (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-none border-zinc-700 text-zinc-300 hover:bg-white/5"
                >
                  <a href={process.secondaryCtaHref ?? "/contact"}>
                    {process.secondaryCtaLabel}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
            {(process.items ?? []).map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="relative border border-white/10 p-5 transition hover:border-[#1E90FF]/60 hover:bg-white/[0.02]"
              >
                <span className={cn("font-mono text-sm", cobaltClass.accent)}>
                  {item.meta ?? String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 font-medium">{item.title}</p>
                {item.description ? (
                  <p className="mt-2 text-sm text-zinc-400">
                    {item.description}
                  </p>
                ) : null}
                <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[#1E90FF]/10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className={cn(
                "font-mono text-xs tracking-[0.3em] uppercase",
                cobaltClass.eyebrowStrong,
              )}
            >
              {projects.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              {projects.title}
            </h2>
            <RichText
              html={projects.bodyHtml}
              className="mt-3 max-w-xl text-zinc-400"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {projects.ctaLabel ? (
              <Button
                asChild
                variant="outline"
                className="rounded-none border-zinc-600 text-zinc-100"
              >
                <a href={projects.ctaHref ?? "/work"}>
                  {projects.ctaLabel}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            ) : null}
            {projects.secondaryCtaLabel ? (
              <Button
                asChild
                variant="outline"
                className="rounded-none border-zinc-700 text-zinc-300 hover:bg-white/5"
              >
                <a href={projects.secondaryCtaHref ?? "/contact"}>
                  {projects.secondaryCtaLabel}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {(projects.items ?? [])
            .map((item, index) =>
              resolveProjectSectionItem(item, index, projectSources),
            )
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
            .map((item) => (
              <article key={item.key} className="border border-white/10">
                <div className="relative aspect-[16/10] bg-gradient-to-br from-[#1E90FF]/25 to-transparent">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : null}
                </div>
                <div className="p-6">
                  {item.meta ? (
                    <p
                      className={cn(
                        "font-mono text-[11px] tracking-[0.25em] uppercase",
                        cobaltClass.accent,
                      )}
                    >
                      {item.meta}
                    </p>
                  ) : null}
                  <h3 className={cn("font-medium", item.meta && "mt-2")}>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#1E90FF]/90" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-white/80 uppercase">
            {contact.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {contact.title}
          </h2>
          <RichText
            html={contact.bodyHtml}
            className="mt-4 max-w-2xl text-white/90"
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {contact.ctaLabel ? (
              <Button
                asChild
                size="lg"
                className="rounded-none bg-white px-8 text-zinc-950 hover:bg-white/90"
              >
                <a href={contact.ctaHref ?? "/contact"}>
                  {contact.ctaLabel}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            ) : null}
            {contact.secondaryCtaLabel ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-none border-white/70 bg-transparent text-white hover:bg-white/10"
              >
                <a href={contact.secondaryCtaHref ?? "/services"}>
                  {contact.secondaryCtaLabel}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <CobaltSiteFooter />
    </div>
  );
}
