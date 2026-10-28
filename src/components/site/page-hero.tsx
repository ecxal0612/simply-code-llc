import { cn } from "~/lib/utils";
import { RichText } from "~/components/site/rich-text";
import { heroSectionEndClassName } from "~/lib/site/hero-section";

export function PageHero({
  eyebrow,
  title,
  description,
  descriptionHtml,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("relative overflow-hidden", heroSectionEndClassName, className)}
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        {eyebrow ? (
          <p className="font-mono text-xs tracking-[0.35em] text-[#1E90FF] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-6 max-w-4xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            {description}
          </p>
        ) : null}
        {descriptionHtml ? (
          <RichText
            html={descriptionHtml}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400"
          />
        ) : null}
        {children ? (
          <div className="mt-10 flex flex-wrap gap-4">{children}</div>
        ) : null}
      </div>
    </section>
  );
}
