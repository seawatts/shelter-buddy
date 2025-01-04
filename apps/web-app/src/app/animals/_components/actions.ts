"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@acme/db/client";
import { Animals, Walks } from "@acme/db/schema";

import { authenticatedAction } from "~/safe-action";

export const startWalkAction = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      animalId: z.string(),
      isNewWalk: z.boolean().optional(),
    }),
  )
  .handler(async ({ ctx, input }) => {
    const animal = await db.query.Animals.findFirst({
      where: eq(Animals.id, input.animalId),
    });

    if (!animal) {
      throw new Error("Animal not found");
    }

    // Check if there's already an active walk
    const activeWalk = await db.query.Walks.findFirst({
      where: and(
        eq(Walks.animalId, input.animalId),
        eq(Walks.status, "in_progress"),
        isNull(Walks.endedAt),
      ),
    });

    if (activeWalk) {
      throw new Error("Animal already has an active walk");
    }

    // Create new walk
    const [walk] = await db
      .insert(Walks)
      .values({
        animalId: input.animalId,
        shelterId: animal.shelterId,
        startedAt: new Date(),
        status: "in_progress",
        userId: ctx.user.id,
      })
      .returning();

    if (!walk) {
      throw new Error("Failed to create walk");
    }

    revalidatePath("/animals");

    if (input.isNewWalk ?? true) {
      redirect(`/animals/walks/${walk.id}/in-progress`);
    } else {
      redirect(`/animals/walks/${walk.id}/finished`);
    }
  });

export const stopWalkAction = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      animalId: z.string(),
      notes: z.string().optional(),
      summary: z.string().optional(),
      walkId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const animal = await db.query.Animals.findFirst({
      where: eq(Animals.id, input.animalId),
    });

    if (!animal) {
      throw new Error("Animal not found");
    }

    const walk = await db.query.Walks.findFirst({
      where: eq(Walks.id, input.walkId),
      with: {
        animal: true,
        media: true,
      },
    });

    if (!walk) {
      throw new Error("Walk not found");
    }

    // Update walk status
    await db
      .update(Walks)
      .set({
        endedAt: new Date(),
        status: "completed",
      })
      .where(eq(Walks.id, input.walkId));

    revalidatePath("/animals");
    redirect(`/animals/walks/${walk.id}/finished`);
  });
