"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { parseTechnologies } from "~/lib/team/schema";
import { useUploadThing } from "~/lib/uploadthing";

export type TeamMemberFormInitial = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  imageUrl: string | null;
  technologies: string[];
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TeamMemberForm({ member }: { member?: TeamMemberFormInitial }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing("avatar");
  const isEditing = Boolean(member);

  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [bio, setBio] = useState(member?.bio ?? "");
  const [imageUrl, setImageUrl] = useState(member?.imageUrl ?? "");
  const [technologies, setTechnologies] = useState(
    (member?.technologies ?? []).join(", "),
  );
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const technologyList = parseTechnologies(technologies);
  const busy = saving;

  function handlePhotoSelected(file: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    toast.message("Photo queued — it will upload when you save.");
  }

  async function uploadPendingPhoto(previousUrl: string) {
    if (!pendingImageFile) return imageUrl || undefined;
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Add the member's name first.");
      return;
    }

    setSaving(true);
    const previousUrl = imageUrl;
    try {
      const nextImageUrl = await uploadPendingPhoto(previousUrl);

      const res = await fetch(
        isEditing && member ? `/api/team/${member.id}` : "/api/team",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            role: role.trim() || undefined,
            bio: bio.trim() || undefined,
            imageUrl: nextImageUrl || undefined,
            technologies: technologyList,
          }),
        },
      );
      const data = (await res.json().catch(() => null)) as {
        member?: { id: string };
        error?: string;
      } | null;
      if (!res.ok || !data?.member) {
        throw new Error(data?.error ?? "Could not save team member");
      }

      toast.success(isEditing ? "Team member updated" : "Team member added");
      router.push("/dashboard/team");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save team member",
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/dashboard/team">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to team
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">
            {isEditing ? `Edit ${member?.name}` : "Add team member"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            This information is shown when the member is selected in the About
            Us team section.
          </p>
        </div>
        <Button type="submit" disabled={busy}>
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {isEditing ? "Save changes" : "Add member"}
        </Button>
      </div>

      <div className="rounded-lg border p-4">
        <div className="max-w-2xl space-y-2">
          <Label htmlFor="team-name">Name</Label>
          <Input
            id="team-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Ryan Hunter"
            required
            autoFocus
          />
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="grid gap-6 md:grid-cols-[13rem_1fr]">
          <div className="space-y-3">
            <Label>Photo</Label>
            <div className="bg-muted relative flex size-32 items-center justify-center overflow-hidden rounded-full border">
              {previewUrl || imageUrl ? (
                <Image
                  src={previewUrl ?? imageUrl!}
                  alt={name || "Team member"}
                  fill
                  className="object-cover"
                  sizes="128px"
                  unoptimized={Boolean(previewUrl)}
                />
              ) : (
                <span className="text-muted-foreground font-mono text-lg font-semibold">
                  {getInitials(name) || "?"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
              >
                <ImagePlus className="size-3.5" />
                {imageUrl || previewUrl ? "Replace" : "Choose photo"}
              </Button>
              {imageUrl || previewUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setPendingImageFile(null);
                    setImageUrl("");
                  }}
                  disabled={busy}
                >
                  <X className="size-3.5" />
                  Remove
                </Button>
              ) : null}
            </div>
            <p className="text-muted-foreground text-xs">
              JPG, PNG, or WebP up to 4 MB. Uploads when you save.
            </p>
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
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-role">Role</Label>
              <Input
                id="team-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="e.g. Full-Stack Developer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-bio">Biography</Label>
              <Textarea
                id="team-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Describe this person's experience and focus."
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-technologies">Technologies</Label>
              <Input
                id="team-technologies"
                value={technologies}
                onChange={(event) => setTechnologies(event.target.value)}
                placeholder="Next.js, TypeScript, PostgreSQL"
              />
              <p className="text-muted-foreground text-xs">
                Separate each technology with a comma.
              </p>
              {technologyList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {technologyList.map((technology) => (
                    <span
                      key={technology}
                      className="text-muted-foreground rounded-full border px-2 py-0.5 text-[11px]"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {isEditing ? "Save changes" : "Add member"}
        </Button>
      </div>
    </form>
  );
}
