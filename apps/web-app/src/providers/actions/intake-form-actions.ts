"use server";

import { revalidatePath } from "next/cache";
import { Image } from "@boundaryml/baml";
import { z } from "zod";

import { authenticatedAction } from "~/safe-action";
import { b } from "../../../../../baml_client";

export const analyzeIntakeFormAction = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      imageUrl: z.string(),
      roomId: z.string(),
      shelterId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      // Ensure the URL doesn't have any trailing periods
      const cleanUrl = input.imageUrl.replace(/\.$/, "");
      const image = Image.fromUrl(cleanUrl);

      const formData = await b.ExtractIntakeForm(image);

      revalidatePath(
        `/shelters/${input.shelterId}/rooms/${input.roomId}/kennels`,
      );

      return {
        data: formData,
        success: true,
      };
    } catch (error) {
      console.error(
        "Error analyzing intake form:",
        error instanceof Error ? error.message : "Unknown error",
      );
      return {
        error: "Failed to analyze intake form",
        success: false,
      };
    }
  });
