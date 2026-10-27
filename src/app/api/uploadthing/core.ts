import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { isHomepageImageSlotId } from "~/lib/home/image-slots";
import { auth } from "~/lib/auth";
import { hasPreparedHomepageSlot, updateHomepageImageFromUpload } from "~/server/homepage-images";
import {
  hasPreparedSiteLogo,
  updateSiteLogoFromUpload,
} from "~/server/site-header";
import { getPageImageById, updateImageFromUpload } from "~/server/pages";

const f = createUploadthing();

export const ourFileRouter = {
  avatar: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl ?? file.url };
    }),

  homepageImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .input(z.object({ slot: z.string().min(1) }))
    .middleware(async ({ input }) => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      if (!isHomepageImageSlotId(input.slot)) {
        throw new UploadThingError("Invalid homepage image slot");
      }

      const prepared = await hasPreparedHomepageSlot(input.slot);
      if (!prepared) {
        throw new UploadThingError("Prepare this image in the dashboard before uploading.");
      }

      return { userId: session.user.id, slot: input.slot };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      if (!isHomepageImageSlotId(metadata.slot)) {
        throw new UploadThingError("Invalid slot on upload complete");
      }

      await updateHomepageImageFromUpload({
        slot: metadata.slot,
        url: file.ufsUrl ?? file.url,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      });

      return { slot: metadata.slot, url: file.ufsUrl ?? file.url };
    }),

  /**
   * Section and inline images. A row must already exist in `images` (prepared in the
   * dashboard) before Uploadthing accepts the file, so the database is the source of truth.
   */
  pageImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .input(z.object({ imageId: z.string().uuid() }))
    .middleware(async ({ input }) => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      const image = await getPageImageById(input.imageId);
      if (!image) {
        throw new UploadThingError("Register this image in the database before uploading.");
      }

      return { userId: session.user.id, imageId: image.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      await updateImageFromUpload(metadata.imageId, {
        url,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      });

      return { imageId: metadata.imageId, url };
    }),

  siteLogo: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      const prepared = await hasPreparedSiteLogo();
      if (!prepared) {
        throw new UploadThingError(
          "Prepare the logo in the dashboard before uploading.",
        );
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await updateSiteLogoFromUpload({
        url: file.ufsUrl ?? file.url,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      });

      return { uploadedBy: metadata.userId, url: file.ufsUrl ?? file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
