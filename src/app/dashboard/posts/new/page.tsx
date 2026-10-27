import { PostForm } from "~/app/dashboard/posts/post-form";
import { listPostCategories } from "~/server/posts";

export default async function NewPostPage() {
  const categories = await listPostCategories();

  return <PostForm availableCategories={categories} />;
}
