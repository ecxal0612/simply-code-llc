import "server-only";

import { UTApi } from "uploadthing/server";
import { env } from "~/env";

let utapi: UTApi | null = null;

function getUtApi(): UTApi | null {
  if (!env.UPLOADTHING_TOKEN) return null;
  utapi ??= new UTApi();
  return utapi;
}

/** True when the URL points at an Uploadthing-hosted file we can purge. */
export function isManagedUploadUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const value = url.trim();
  if (value.startsWith("pending:")) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return false;
  return (
    value.includes("utfs.io") ||
    value.includes("uploadthing.com") ||
    value.includes("ufs.sh")
  );
}

/** Deletes a replaced file from Uploadthing storage (no-op if not hosted there). */
export async function deleteManagedUpload(
  url: string | null | undefined,
): Promise<void> {
  if (!isManagedUploadUrl(url)) return;
  const api = getUtApi();
  if (!api) return;

  try {
    await api.deleteFiles(url!.trim());
  } catch (error) {
    console.error("[uploadthing] Failed to delete file:", error);
  }
}
