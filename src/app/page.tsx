import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CobaltHomepage } from "~/components/home/cobalt-homepage";
import { auth } from "~/lib/auth";
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
  const session = await auth();
  const page = await getPageForViewer("/", searchParams);
  if (!page) notFound();

  const [images, projectsById] = await Promise.all([
    getImageUrlsForSections(page.sections),
    getProjectsMapForPageSections(page.sections),
  ]);

  return (
    <CobaltHomepage
      isLoggedIn={!!session?.user}
      page={page}
      images={images}
      projectsById={projectsById}
    />
  );
}
