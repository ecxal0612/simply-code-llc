"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { generateReactHelpers } from "@uploadthing/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { OurFileRouter } from "~/app/api/uploadthing/core";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { MAX_POST_IMAGES, postFormSchema, type PostFormInput } from "~/schemas/post";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export function PostForm() {
  const queryClient = useQueryClient();
  const { startUpload, isUploading } = useUploadThing("postImage");
  const [files, setFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  const form = useForm<PostFormInput>({
    resolver: zodResolver(postFormSchema),
    defaultValues: { title: "", body: "" },
  });

  const isSubmitting = form.formState.isSubmitting || isUploading;
  const tooManyFiles = files.length > MAX_POST_IMAGES;

  async function onSubmit(values: PostFormInput) {
    if (tooManyFiles) {
      toast.error(`Up to ${MAX_POST_IMAGES} images per post.`);
      return;
    }

    let uploaded: { url: string; name: string; size: number; mimeType: string }[] = [];
    if (files.length > 0) {
      let result: Awaited<ReturnType<typeof startUpload>>;
      try {
        result = await startUpload(files);
      } catch {
        toast.error("Could not upload images. Check UPLOADTHING_TOKEN and try again.");
        return;
      }

      if (!result) {
        toast.error("Image upload was cancelled.");
        return;
      }

      uploaded = result.map((file) => ({
        url: file.ufsUrl ?? file.url,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      }));
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        body: values.body,
        images: uploaded,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      toast.error(typeof data?.error === "string" ? data.error : "Could not create post");
      return;
    }

    toast.success("Post created");
    form.reset();
    setFiles([]);
    setFileInputKey((key) => key + 1);
    void queryClient.invalidateQueries({ queryKey: ["posts"] });
  }

  return (
    <section className="rounded-md border p-4">
      <h2 className="text-lg font-medium">New post</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Attach up to {MAX_POST_IMAGES} images (4MB each) — they are uploaded to Uploadthing and saved with the post.
      </p>
      <form className="mt-4 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="post-title">Title</Label>
          <Input id="post-title" placeholder="Post title" {...form.register("title")} />
          {form.formState.errors.title ? (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="post-body">Body</Label>
          <Textarea
            id="post-body"
            placeholder="Write something… (optional)"
            rows={4}
            {...form.register("body")}
          />
          {form.formState.errors.body ? (
            <p className="text-sm text-destructive">{form.formState.errors.body.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="post-images">Images</Label>
          <Input
            key={fileInputKey}
            id="post-images"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
          {tooManyFiles ? (
            <p className="text-sm text-destructive">Up to {MAX_POST_IMAGES} images per post.</p>
          ) : null}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isUploading ? "Uploading images…" : form.formState.isSubmitting ? "Creating…" : "Create post"}
        </Button>
      </form>
    </section>
  );
}
