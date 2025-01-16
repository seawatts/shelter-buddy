"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@acme/db/client";
import { AnimalMedia } from "@acme/db/schema";

import { env } from "~/env.server";
import { authenticatedAction } from "~/safe-action";
import { createClient } from "~/supabase/server";

export const uploadPhotoAction = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      animalId: z.string(),
      defaultPhoto: z.boolean().optional(),
      filePath: z.string(),
      height: z.number(),
      shelterId: z.string(),
      size: z.number(),
      type: z.string(),
      walkId: z.string().optional(),
      width: z.number(),
    }),
  )
  .handler(async ({ ctx, input }) => {
    // Create a new media record in the database
    await db.insert(AnimalMedia).values({
      animalId: input.animalId,
      createdByUserId: ctx.user.id,
      default: input.defaultPhoto ?? false,
      height: input.height,
      s3Path: input.filePath,
      shelterId: input.shelterId,
      sizeBytes: input.size,
      thumbnailUrl: null,
      type: input.type,
      walkId: input.walkId ?? null,
      width: input.width,
    });

    revalidatePath(`/shelters/${input.shelterId}/rooms/0bubjwF/kennels`);

    if (input.walkId) {
      revalidatePath(
        `/shelters/${input.shelterId}/animals/${input.animalId}/walks/${input.walkId}/in-progress`,
      );
      revalidatePath(
        `/shelters/${input.shelterId}/animals/${input.animalId}/walks/${input.walkId}/finished`,
      );
      revalidatePath(
        `/shelters/${input.shelterId}/animals/${input.animalId}/walks/${input.walkId}`,
      );
    }
  });

export const deletePhotoAction = authenticatedAction
  .createServerAction()
  .input(z.object({ mediaId: z.string() }))
  .handler(async ({ input }) => {
    // Get the media record to get the file path
    const media = await db.query.AnimalMedia.findFirst({
      where: eq(AnimalMedia.id, input.mediaId),
    });

    if (!media) {
      throw new Error("Media not found");
    }

    // Delete the file from storage
    const supabase = await createClient();
    const { error: storageError } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .remove([media.s3Path]);

    if (storageError) {
      throw storageError;
    }

    // Delete the media record from the database
    await db.delete(AnimalMedia).where(eq(AnimalMedia.id, input.mediaId));

    revalidatePath("/animals");
  });
