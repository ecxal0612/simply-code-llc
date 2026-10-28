import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { RichText } from "~/components/site/rich-text";

export function CtaSection({
  eyebrow,
  title,
  description,
  descriptionHtml,
  ctaLabel,
  href = "/contact",
  secondaryCtaLabel,
  secondaryCtaHref = "/services",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  ctaLabel: string;
  href?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[#1E90FF]/90" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center">
        {eyebrow ? (
          <p className="font-mono text-xs tracking-[0.35em] text-white/80 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-2xl text-white/90">{description}</p>
        ) : null}
        {descriptionHtml ? (
          <RichText
            html={descriptionHtml}
            className="mt-4 max-w-2xl text-white/90"
          />
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-[10px] bg-white px-8 text-zinc-950 hover:bg-white/90"
          >
            <Link href={href}>
              {ctaLabel}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
          {secondaryCtaLabel ? (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-[10px] border-white/70 bg-transparent text-white hover:bg-white/10"
            >
              <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
