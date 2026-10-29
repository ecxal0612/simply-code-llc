"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { ProjectLink } from "~/server/db/schema";
import { useUploadThing } from "~/lib/uploadthing";

export type EditableProject = {
  id: string;
  title: string;
  description: string | null;
  label: string | null;
  projectDate: string | null;
  imageUrl: string | null;
  links: ProjectLink[];
};

export function ProjectForm({ project }: { project?: EditableProject }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing("avatar");
  const isEditing = Boolean(project);

  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [label, setLabel] = useState(project?.label ?? "");
  const [projectDate, setProjectDate] = useState(project?.projectDate ?? "");
  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? "");
  const [links, setLinks] = useState<ProjectLink[]>(
    project?.links?.length
      ? project.links
      : [{ label: "View Project", url: "https://" }],
  );
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const busy = saving;

  function handlePhotoSelected(file: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    toast.message("Image queued — it will upload when you save.");
  }

  async function uploadPendingPhoto(previousUrl: string) {
    if (!pendingImageFile) return imageUrl.trim() || null;
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

  function updateLink(index: number, field: keyof ProjectLink, value: string) {
    setLinks((current) =>
      current.map((link, i) =>
        i === index ? { ...link, [field]: value } : link,
      ),
    );
  }

  function addLink() {
    setLinks((current) => [...current, { label: "Link", url: "https://" }]);
  }

  function removeLink(index: number) {
    setLinks((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Add a project title first.");
      return;
    }

    const normalizedLinks = links
      .map((link) => ({
        label: link.label.trim(),
        url: link.url.trim(),
      }))
      .filter((link) => link.label && link.url && link.url !== "https://");

    setSaving(true);
    const previousUrl = imageUrl;
    try {
      const nextImageUrl = await uploadPendingPhoto(previousUrl);

      const res = await fetch(
        isEditing && project ? `/api/projects/${project.id}` : "/api/projects",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() ? description.trim() : null,
            label: label.trim() ? label.trim() : null,
            projectDate: projectDate.trim() ? projectDate.trim() : null,
            imageUrl: nextImageUrl,
            links: normalizedLinks,
          }),
        },
      );
      const data = (await res.json().catch(() => null)) as {
        project?: EditableProject;
        error?: string;
      } | null;
      if (!res.ok || !data?.project) {
        throw new Error(data?.error ?? "Could not save project");
      }

      const saved = data.project;
      setTitle(saved.title);
      setDescription(saved.description ?? "");
      setLabel(saved.label ?? "");
      setProjectDate(saved.projectDate ?? "");
      setImageUrl(nextImageUrl ?? saved.imageUrl ?? "");
      setLinks(
        saved.links?.length
          ? saved.links
          : [{ label: "View Project", url: "https://" }],
      );

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingImageFile(null);

      toast.success(isEditing ? "Project saved" : "Project created");
      if (isEditing) {
        router.refresh();
      } else {
        router.push(`/dashboard/projects/${data.project.id}`);
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save project",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/dashboard/projects">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to projects
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">
            {isEditing ? "Edit project" : "Create new project"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Projects are reused on the Homepage and Our Work sections. They do
            not have a public detail page.
          </p>
        </div>
        <Button type="submit" disabled={busy}>
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {isEditing ? "Save project" : "Create project"}
        </Button>
      </div>

      <div className="space-y-2 rounded-lg border p-4">
        <Label htmlFor="project-title">Project title</Label>
        <Input
          id="project-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Customer portal redesign"
          className="text-lg font-medium"
          autoFocus
          required
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <div className="space-y-2 rounded-lg border p-4">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What was built, the problem solved, and the outcome."
              rows={6}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-lg border p-4">
              <Label htmlFor="project-label">Label / role</Label>
              <Input
                id="project-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="e.g. Full-stack web app"
              />
            </div>
            <div className="space-y-2 rounded-lg border p-4">
              <Label htmlFor="project-date">Date</Label>
              <Input
                id="project-date"
                value={projectDate}
                onChange={(event) => setProjectDate(event.target.value)}
                placeholder="e.g. 2025 or March 2025"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <Label>Links</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLink}>
                <Plus className="mr-1.5 size-3.5" />
                Add link
              </Button>
            </div>
            {links.map((link, index) => (
              <div key={index} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1.4fr_auto]">
                <Input
                  value={link.label}
                  onChange={(event) =>
                    updateLink(index, "label", event.target.value)
                  }
                  placeholder="Link label"
                />
                <Input
                  value={link.url}
                  onChange={(event) =>
                    updateLink(index, "url", event.target.value)
                  }
                  placeholder="https://"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => removeLink(index)}
                  disabled={links.length <= 1}
                  aria-label="Remove link"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-lg border p-4">
          <Label>Featured image</Label>
          <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-md border">
            {previewUrl || imageUrl ? (
              <Image
                src={previewUrl ?? imageUrl!}
                alt={title || "Project featured image"}
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
              if (file) void handlePhotoSelected(file);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="mr-2 size-4" />
            Choose image
          </Button>
          <p className="text-muted-foreground text-xs">
            Uploads to storage when you save the project.
          </p>
        </div>
      </div>
    </form>
  );
}
