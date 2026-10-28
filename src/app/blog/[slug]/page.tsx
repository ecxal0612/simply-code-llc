import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostLayout } from "~/components/blog/blog-post-layout";
import { SiteLayout } from "~/components/site/site-layout";
import { postExcerpt } from "~/lib/posts/types";
import { getPostForViewer, type PostSearchParams } from "~/server/post-preview";
import { getRelatedPosts } from "~/server/posts";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: PostSearchParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostForViewer(slug, searchParams);
  if (!post) return { title: "Post not found | Simply Code LLC" };

  return {
    title: `${post.title} | Simply Code LLC`,
    description: postExcerpt(post.body, 160),
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: PostSearchParams;
}) {
  const { slug } = await params;
  const post = await getPostForViewer(slug, searchParams);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post);

  return (
    <SiteLayout>
      <BlogPostLayout post={post} relatedPosts={relatedPosts} />
    </SiteLayout>
  );
}
