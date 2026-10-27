import { notFound } from "next/navigation";
import { PostForm, type EditablePost } from "~/app/dashboard/posts/post-form";
import { getPostById, listPostCategories } from "~/server/posts";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    getPostById(id),
    listPostCategories(),
  ]);
  if (!post) notFound();

  const editable: EditablePost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post.status,
    body: post.body,
    categories: post.categories,
    featuredImageUrl: post.featuredImageUrl,
  };

  return <PostForm post={editable} availableCategories={categories} />;
}
