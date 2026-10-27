"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ExternalLink, Home, ImagePlus, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { HeaderNavOrderList } from "~/app/dashboard/site-header/header-nav-order-list";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useUploadThing } from "~/lib/uploadthing";

type PageOption = {
  id: string;
  title: string;
  path: string;
  status: string;
};

async function prepareLogo() {
  const res = await fetch("/api/site-header/logo/prepare", { method: "POST" });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Could not prepare logo in database");
  }
}

export function SiteHeaderSettings({
  pages,
  initialNavPaths,
  logoUrl,
}: {
  pages: PageOption[];
  initialNavPaths: string[];
  logoUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing("siteLogo");
  const [navOrder, setNavOrder] = useState<string[]>(initialNavPaths);
  const [savingNav, setSavingNav] = useState(false);
  const [savingLogo, setSavingLogo] = useState(false);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const pageByPath = useMemo(
    () => new Map(pages.map((page) => [page.path, page])),
    [pages],
  );

  const sortedPages = useMemo(
    () => [...pages].sort((a, b) => a.path.localeCompare(b.path)),
    [pages],
  );

  const selectedSet = useMemo(() => new Set(navOrder), [navOrder]);

  function togglePath(path: string) {
    setNavOrder((current) => {
      if (current.includes(path)) {
        return current.filter((item) => item !== path);
      }
      return [...current, path];
    });
  }

  function handleLogoSelected(file: File) {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setPendingLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
    toast.message("Logo queued — click Save logo to upload.");
  }

  async function handleSaveLogo() {
    if (!pendingLogoFile) {
      toast.error("Choose a logo image first.");
      return;
    }
    setSavingLogo(true);
    try {
      await prepareLogo();
      const uploaded = await startUpload([pendingLogoFile]);
      if (!uploaded?.[0]) throw new Error("Upload did not complete");
      toast.success("Logo saved");
      setPendingLogoFile(null);
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save logo",
      );
    } finally {
      setSavingLogo(false);
    }
  }

  async function handleSaveNav() {
    setSavingNav(true);
    try {
      const res = await fetch("/api/site-header", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headerNavPaths: navOrder }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not save header navigation");
      }
      toast.success("Header navigation saved");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save navigation",
      );
    } finally {
      setSavingNav(false);
    }
  }

  const displayLogoUrl = logoPreviewUrl ?? logoUrl;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Site logo</CardTitle>
          <CardDescription>
            Registered in the database first, then uploaded to Uploadthing when
            you click Save logo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="bg-muted flex size-20 items-center justify-center overflow-hidden rounded-lg border">
            {displayLogoUrl ? (
              <Image
                src={displayLogoUrl}
                alt="Site logo"
                width={80}
                height={80}
                className="size-full object-contain p-2"
                unoptimized={Boolean(logoPreviewUrl)}
              />
            ) : (
              <span className="text-muted-foreground font-mono text-sm">SC</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleLogoSelected(file);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={savingLogo}
            >
              <ImagePlus className="mr-2 size-4" />
              Choose logo
            </Button>
            <Button
              type="button"
              onClick={() => void handleSaveLogo()}
              disabled={savingLogo || !pendingLogoFile}
            >
              {savingLogo ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save logo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Header navigation</CardTitle>
              <CardDescription className="mt-1.5">
                Choose which pages appear in the public header and drag to set
                their order.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/" target="_blank" rel="noreferrer">
                <Home className="mr-2 size-4" />
                View homepage
                <ExternalLink className="ml-2 size-3.5 opacity-60" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Menu order</p>
            <HeaderNavOrderList
              paths={navOrder}
              pageByPath={pageByPath}
              onReorder={setNavOrder}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Pages in the header</p>
            <div className="divide-y rounded-lg border">
              {sortedPages.map((page) => {
                const checked = selectedSet.has(page.path);
                return (
                  <label
                    key={page.id}
                    className="flex cursor-pointer items-start gap-3 p-4 transition hover:bg-muted/40"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4 rounded border"
                      checked={checked}
                      onChange={() => togglePath(page.path)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{page.title}</p>
                      <p className="text-muted-foreground font-mono text-xs">
                        {page.path}
                      </p>
                      {page.status !== "published" ? (
                        <p className="mt-1 text-xs text-amber-600">
                          Draft pages are hidden on the live site even if
                          selected.
                        </p>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <Button
            type="button"
            onClick={() => void handleSaveNav()}
            disabled={savingNav}
          >
            {savingNav ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Save navigation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
