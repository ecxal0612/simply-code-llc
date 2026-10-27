import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteLayout } from "~/components/site/site-layout";
import { RichText } from "~/components/site/rich-text";
import { getPageForViewer, type PageSearchParams } from "~/server/page-preview";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: PageSearchParams;
}): Promise<Metadata> {
  const page = await getPageForViewer("/privacy-policy", searchParams);
  return {
    title: `${page?.title ?? "Privacy Policy"} | Simply Code LLC`,
    description: "Privacy Policy for Simply Code LLC.",
  };
}

export default async function PrivacyPolicyPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const page = await getPageForViewer("/privacy-policy", searchParams);
  if (!page) notFound();

  const header =
    page.sections.find((section) => section.key === "header")?.content ?? {};
  const policySections = page.sections.filter(
    (section) => section.kind === "policy",
  );

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-6 py-16">
        <header className="border-b border-white/10 pb-8">
          <p className="font-mono text-xs tracking-[0.3em] text-[#1E90FF] uppercase">
            {header.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            {header.title ?? page.title}
          </h1>
          {header.updatedAtLabel ? (
            <p className="mt-4 text-sm text-zinc-500">
              Last updated: {header.updatedAtLabel}
            </p>
          ) : null}
          <RichText html={header.bodyHtml} className="mt-6 text-zinc-400" />
        </header>

        <div className="mt-10 space-y-10 text-zinc-400">
          {policySections.map((section) => (
            <section key={section.id} className="space-y-4">
              <h2 className="text-xl font-semibold text-zinc-100">
                {section.content.title}
              </h2>
              <RichText html={section.content.bodyHtml} />
            </section>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
