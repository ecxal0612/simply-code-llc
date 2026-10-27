"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "~/components/editor/rich-text-editor";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { slugifyPageTitle } from "~/lib/pages/types";

export function PageCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slugValue, setSlugValue] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [bodyHtml, setBodyHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const slug = slugTouched ? slugValue : slugifyPageTitle(title);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Add a page title first.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          status,
          bodyHtml,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        page?: { id: string };
        error?: string;
      } | null;
      if (!res.ok || !data?.page) {
        throw new Error(data?.error ?? "Could not create page");
      }

      toast.success("Page created");
      router.push(`/dashboard/pages/${data.page.id}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create page",
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/dashboard/pages">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to pages
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Create new page</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            The URL is generated from the title. You can change it before
            saving.
          </p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          Create page
        </Button>
      </div>

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="page-title">Page title</Label>
          <Input
            id="page-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Our Process"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="page-status">Status</Label>
          <select
            id="page-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "draft" | "published")
            }
            className="border-input flex h-9 w-full border bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Publish</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="page-slug">URL slug</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-sm">/</span>
            <Input
              id="page-slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlugValue(slugifyPageTitle(event.target.value));
              }}
              placeholder="our-process"
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Public URL:{" "}
            <span className="font-mono">/{slug || "your-page"}</span>
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <Label>Page content</Label>
          <p className="text-muted-foreground text-xs">
            Use the WYSIWYG editor for paragraphs, headings, lists, links, and
            images. Save the page before adding images.
          </p>
        </div>
        <RichTextEditor
          value={bodyHtml}
          onChange={setBodyHtml}
          placeholder="Write the page content…"
        />
      </div>
    </form>
  );
}
