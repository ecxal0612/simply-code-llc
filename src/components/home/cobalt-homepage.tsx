import Image from "next/image";
import {
  ArrowUpRight,
  Boxes,
  Cpu,
  GitBranch,
  LineChart,
  Shield,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { CobaltSiteHeader } from "~/components/home/cobalt-site-header";
import { ContactInquiryForm } from "~/components/home/contact-inquiry-form";
import { HeroParticleField } from "~/components/home/hero-particle-field";
import { HomeNavigationEffects } from "~/components/home/home-navigation-effects";
import { Button } from "~/components/ui/button";
import { homeCopy } from "~/lib/home/content";
import { cobaltClass } from "~/lib/home/cobalt-theme";
import type { ResolvedHomepageImages } from "~/server/homepage-images";
import { cn } from "~/lib/utils";

const whyIcons = [Users, Boxes, Sparkles, GitBranch, Shield, LineChart];

export function CobaltHomepage({
  isLoggedIn,
  images,
}: {
  isLoggedIn: boolean;
  images: ResolvedHomepageImages;
}) {
  const c = homeCopy;

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
      <CobaltSiteHeader isLoggedIn={isLoggedIn} />

      <section className="relative flex min-h-[90vh] flex-col justify-end overflow-hidden">
        <Image
          src={images.hero}
          alt=""
          fill
          className="object-cover opacity-25"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/25" />
        <HeroParticleField className="z-[3]" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-32 md:pb-28 md:pt-40">
          <p className={cn("font-mono text-xs tracking-[0.35em] uppercase", cobaltClass.eyebrow)}>
            {c.hero.eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {c.hero.headline}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400">{c.hero.body}</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className={cn("h-12 rounded-none px-8", cobaltClass.btn)}>
              <a href="#contact">{c.hero.primaryCta}</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-none border-zinc-600 bg-transparent text-zinc-100 hover:bg-white/5"
            >
              <a href="#services">{c.hero.secondaryCta}</a>
            </Button>
          </div>
          <p className="mt-8 font-mono text-xs text-zinc-500 uppercase">{c.hero.supporting}</p>
        </div>
      </section>

      <section id="services" className="border-y border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className={cn("font-mono text-xs tracking-[0.3em] uppercase", cobaltClass.eyebrowStrong)}>
                {c.services.eyebrow}
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{c.services.title}</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400 md:text-right">{c.services.intro}</p>
          </div>
          <div className="mt-16 divide-y divide-white/10 border border-white/10">
            {c.services.items.map((item, i) => (
              <article
                key={item.title}
                className="group grid gap-4 p-6 transition hover:bg-white/[0.02] md:grid-cols-[4rem_1fr_2fr] md:items-start md:gap-8 md:p-8"
              >
                <span className={cn("font-mono text-2xl font-light", cobaltClass.mutedAccent)}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={cn("text-xl font-medium", cobaltClass.titleHover)}>{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-0 lg:grid-cols-12">
          <div className="relative min-h-[280px] lg:col-span-5">
            <Image
              src={images.experience}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
          </div>
          <div className="flex flex-col justify-center border border-t-0 border-white/10 bg-zinc-900/50 p-8 lg:col-span-7 lg:border-t lg:border-l-0 lg:p-14">
            <p className={cn("font-mono text-xs tracking-[0.3em] uppercase", cobaltClass.eyebrowStrong)}>
              {c.experience.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">{c.experience.title}</h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-400">
              {c.experience.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            <p className="mt-6 text-xs text-zinc-500">{c.experience.supporting}</p>
            <Button asChild className={cn("mt-8 w-fit rounded-none", cobaltClass.btn)}>
              <a href="#contact">
                {c.experience.cta}
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section id="technology" className={cn("py-24", cobaltClass.sectionTech)}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs font-semibold tracking-[0.3em] uppercase text-white/75">
                {c.technology.eyebrow}
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight">{c.technology.title}</h2>
              <p className="mt-6 leading-relaxed text-white/85">{c.technology.intro}</p>
              <p className="mt-8 text-sm font-medium text-white/75">{c.technology.supporting}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {c.technology.items.map((item) => (
                <div key={item.title} className="border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                  <Cpu className="mb-3 size-5 text-white/70" />
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="mx-auto max-w-7xl px-6 py-24">
        <p className={cn("font-mono text-xs tracking-[0.3em] uppercase", cobaltClass.eyebrowStrong)}>
          {c.team.eyebrow}
        </p>
        <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">{c.team.title}</h2>
        <p className="mt-6 max-w-2xl text-zinc-400">{c.team.intro}</p>
        <p className="mt-3 max-w-2xl text-zinc-400">{c.team.intro2}</p>
        <div className="mt-16 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {c.team.members.map((member, i) => (
            <article key={member.name} className="bg-zinc-950 p-6">
              <div className="relative mb-5 aspect-square overflow-hidden grayscale transition hover:grayscale-0">
                <Image
                  src={images.team[i] ?? images.team[0]}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              </div>
              <h3 className="text-lg font-medium">{member.name}</h3>
              <p className={cn("mt-1 font-mono text-xs uppercase", cobaltClass.accent)}>{member.role}</p>
              <p className="mt-3 text-sm text-zinc-500">{member.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="process" className="border-y border-white/10 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className={cn("font-mono text-xs tracking-[0.3em] uppercase", cobaltClass.eyebrowStrong)}>
                {c.process.eyebrow}
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight">{c.process.title}</h2>
              <p className="mt-6 text-zinc-400">{c.process.intro}</p>
              <p className="mt-8 flex items-center gap-2 text-sm text-zinc-500">
                <Workflow className={cn("size-4", cobaltClass.accent)} />
                {c.process.closing}
              </p>
            </div>
            <div className="space-y-6">
              {c.process.steps.map((step) => (
                <div key={step.step} className={cn("border-l-2 py-2 pl-6 transition", cobaltClass.borderAccent)}>
                  <span className={cn("font-mono text-sm", cobaltClass.accent)}>{step.step}</span>
                  <h3 className="mt-1 text-xl font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="mx-auto max-w-7xl px-6 py-24">
        <p className={cn("font-mono text-xs tracking-[0.3em] uppercase", cobaltClass.eyebrowStrong)}>
          {c.why.eyebrow}
        </p>
        <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">{c.why.title}</h2>
        <p className="mt-6 max-w-2xl text-zinc-400">{c.why.intro}</p>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {c.why.items.map((item, i) => {
            const Icon = whyIcons[i] ?? Sparkles;
            return (
              <div
                key={item.title}
                className={cn("border border-white/10 p-6 transition hover:bg-white/[0.02]", cobaltClass.cardHover)}
              >
                <Icon className={cn("mb-4 size-5", cobaltClass.accent)} />
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.description}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-16 border-t border-white/10 pt-10 text-center text-sm text-zinc-400">{c.why.closing}</p>
      </section>

      <section id="contact" className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-16 lg:border-r lg:border-white/10">
            <p className={cn("font-mono text-xs tracking-[0.3em] uppercase", cobaltClass.eyebrowStrong)}>
              {c.contact.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">{c.contact.title}</h2>
            <p className="mt-6 text-zinc-400">{c.contact.body}</p>
            <p className="mt-4 text-zinc-400">{c.contact.body2}</p>
            <p className="mt-8 text-sm text-zinc-500">{c.contact.supporting}</p>
          </div>
          <div className="bg-zinc-900/50 p-8 md:p-16">
            <ContactInquiryForm />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center">
        <p className="font-mono text-xs text-zinc-600">
          © {new Date().getFullYear()} {c.brand}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
