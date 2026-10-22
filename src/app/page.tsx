import type { Metadata } from "next";
import { CobaltHomepage } from "~/components/home/cobalt-homepage";
import { auth } from "~/lib/auth";
import { getResolvedHomepageImages } from "~/server/homepage-images";

export const metadata: Metadata = {
  title: "Simply Code LLC",
  description: "Custom websites and web applications — modern development with Next.js and Vercel.",
};

export default async function HomePage() {
  const session = await auth();
  const images = await getResolvedHomepageImages();

  return <CobaltHomepage isLoggedIn={!!session?.user} images={images} />;
}
