import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CobaltHomepage } from "~/components/home/cobalt-homepage";
import { HomeNavigationEffects } from "~/components/home/home-navigation-effects";
import { SiteLayout } from "~/components/site/site-layout";
import { getPageForViewer, type PageSearchParams } from "~/server/page-preview";
import { getImageUrlsForSections } from "~/server/pages";
import { getProjectsMapForPageSections } from "~/server/projects";

export const metadata: Metadata = {
  title: "Simply Code LLC",
  description:
    "Custom websites and web applications — modern development with Next.js and Vercel.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const page = await getPageForViewer("/", searchParams);
  if (!page) notFound();

  const [images, projectsById] = await Promise.all([
    getImageUrlsForSections(page.sections),
    getProjectsMapForPageSections(page.sections),
  ]);

  return (
    <SiteLayout homeNavigationEffects={<HomeNavigationEffects />}>
      <CobaltHomepage page={page} images={images} projectsById={projectsById} />
    </SiteLayout>
  );
}
