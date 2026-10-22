import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { isHomepageImageSlotId } from "~/lib/home/image-slots";
import { auth } from "~/lib/auth";
import { hasPreparedHomepageSlot, updateHomepageImageFromUpload } from "~/server/homepage-images";

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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
