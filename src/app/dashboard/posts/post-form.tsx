"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { commitAllRichTextPendingUploads } from "~/components/editor/rich-text-pending";
import { RichTextEditor } from "~/components/editor/rich-text-editor";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useUploadThing } from "~/lib/uploadthing";
import {
  normalizePostCategories,
  parseCategoryInput,
  slugifyPostTitle,
  type PostStatus,
} from "~/lib/posts/types";

export type EditablePost = {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  body: string | null;
  categories: string[];
  featuredImageUrl?: string | null;
};

export function PostForm({
  post,
  availableCategories,
}: {
  post?: EditablePost;
  availableCategories: string[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing("avatar");
  const [title, setTitle] = useState(post?.title ?? "");
  const [slugValue, setSlugValue] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [bodyHtml, setBodyHtml] = useState(post?.body ?? "");
  const bodyHtmlRef = useRef(post?.body ?? "");
  const [categories, setCategories] = useState<string[]>(
    post?.categories ?? [],
  );
  const [categoryInput, setCategoryInput] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    post?.featuredImageUrl ?? "",
  );
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);
  const slug = slugTouched ? slugValue : slugifyPostTitle(title);

  function handleFeaturedImageSelected(file: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    toast.message("Image queued — it will upload when you save the post.");
  }

  async function uploadPendingFeaturedImage(previousUrl: string) {
    if (!pendingImageFile) return featuredImageUrl || null;
    const uploaded = await startUpload([pendingImageFile]);
    const url = uploaded?.[0]?.ufsUrl ?? uploaded?.[0]?.url;
    if (!url) throw new Error("Upload did not return a URL");
    if (previousUrl && previousUrl !== url) {
      await fetch("/api/uploads/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: previousUrl }),
      }).catch(() => undefined);
    }
    return url;
  }

  useEffect(() => {
    bodyHtmlRef.current = bodyHtml;
  }, [bodyHtml]);
  const suggestions = availableCategories
    .filter(
      (category) =>
        !categories.some(
          (selected) => selected.toLowerCase() === category.toLowerCase(),
        ),
    )
    .slice(0, 12);

  function addCategories(rawValue = categoryInput) {
    const next = normalizePostCategories([
      ...categories,
      ...parseCategoryInput(rawValue),
    ]);
    setCategories(next);
    setCategoryInput("");
  }

  function removeCategory(category: string) {
    setCategories((current) =>
      current.filter((item) => item.toLowerCase() !== category.toLowerCase()),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!title.trim()) {
      toast.error("Add a post title first.");
      return;
    }

    submittingRef.current = true;
    setSaving(true);
    try {
      let postId = post?.id;

      if (!postId) {
        const createRes = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            slug: slug.trim() || undefined,
            status,
            bodyHtml,
            categories,
          }),
        });
        const createData = (await createRes.json().catch(() => null)) as {
          post?: { id: string };
          error?: string;
        } | null;
        if (!createRes.ok || !createData?.post) {
          throw new Error(createData?.error ?? "Could not create post");
        }
        postId = createData.post.id;
      }

      await commitAllRichTextPendingUploads({ postId });

      const previousFeaturedUrl = featuredImageUrl;
      const nextFeaturedUrl = await uploadPendingFeaturedImage(previousFeaturedUrl);

      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          status,
          bodyHtml: bodyHtmlRef.current,
          categories,
          featuredImageUrl: nextFeaturedUrl,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        post?: { id: string };
        error?: string;
      } | null;
      if (!res.ok || !data?.post) {
        throw new Error(data?.error ?? "Could not save post");
      }

      if (nextFeaturedUrl) setFeaturedImageUrl(nextFeaturedUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingImageFile(null);

      toast.success(post ? "Post saved" : "Post created");
      if (post) {
        router.refresh();
      } else {
        router.push(`/dashboard/posts/${data.post.id}`);
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save post",
      );
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/dashboard/posts">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to posts
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">
            {post ? "Edit post" : "Create new post"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {post
              ? "Update the content, categories, or publishing status."
              : "The URL is generated from the title. You can change it before saving."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {post ? (
            post.status === "draft" ? (
              <Button asChild type="button" variant="outline" disabled={saving}>
                <Link
                  href={`/blog/${post.slug}?preview=1`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Eye className="mr-2 size-4" />
                  Preview post
                </Link>
              </Button>
            ) : (
              <Button asChild type="button" variant="outline" disabled={saving}>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="mr-2 size-4" />
                  View post
                </Link>
              </Button>
            )
          ) : null}
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {post ? "Save post" : "Create post"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <Label htmlFor="post-title">Post title</Label>
          <Input
            id="post-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Practical tips for faster websites"
            className="text-lg font-medium"
            autoFocus
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="post-status">Status</Label>
            <select
              id="post-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as PostStatus)}
              className="border-input flex h-9 w-full border bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Publish</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-slug">URL slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-mono text-sm">
                /blog/
              </span>
              <Input
                id="post-slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlugValue(slugifyPostTitle(event.target.value));
                }}
                placeholder="practical-tips"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Public URL:{" "}
              <span className="font-mono">/blog/{slug || "your-post"}</span>
            </p>
          </div>
        </div>
        </div>

        <div className="space-y-3 rounded-lg border p-4 lg:self-start">
          <Label>Featured image</Label>
          <div className="bg-muted relative aspect-[16/9] overflow-hidden rounded-md border">
            {previewUrl || featuredImageUrl ? (
              <Image
                src={previewUrl ?? featuredImageUrl}
                alt={title || "Post featured image"}
                fill
                className="object-cover"
                sizes="280px"
                unoptimized={Boolean(previewUrl)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <ImagePlus className="text-muted-foreground size-8" />
                <p className="text-muted-foreground text-xs">No image yet</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFeaturedImageSelected(file);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={saving}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="mr-2 size-4" />
            Choose image
          </Button>
          <p className="text-muted-foreground text-xs">
            The post is saved first, then the image uploads to storage.
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div>
          <Label htmlFor="post-category-input">Categories</Label>
          <p className="text-muted-foreground text-xs">
            Add topics so readers can discover related posts.
          </p>
        </div>
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="bg-muted inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
              >
                {category}
                <button
                  type="button"
                  onClick={() => removeCategory(category)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${category}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Input
            id="post-category-input"
            value={categoryInput}
            onChange={(event) => setCategoryInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCategories();
              }
            }}
            placeholder="Type a category and press Enter"
            className="max-w-sm"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addCategories()}
            disabled={!categoryInput.trim()}
          >
            <Plus className="mr-2 size-4" />
            Add category
          </Button>
        </div>
        {suggestions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs">Existing:</span>
            {suggestions.map((category) => (
              <Button
                key={category}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addCategories(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <div>
          <Label>Post content</Label>
          <p className="text-muted-foreground text-xs">
            Use the WYSIWYG editor for headings, lists, links, quotes, and
            images.
            {!post ? " Save the post first, then add inline images." : null}
          </p>
        </div>
        <RichTextEditor
          value={bodyHtml}
          onChange={(html) => {
            bodyHtmlRef.current = html;
            setBodyHtml(html);
          }}
          postId={post?.id}
          placeholder="Write the post content…"
        />
      </div>
    </form>
  );
}
