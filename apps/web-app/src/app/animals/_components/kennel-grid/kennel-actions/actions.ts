"use server";

import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@acme/db/client";
import { AnimalNotes, Animals, KennelOccupants } from "@acme/db/schema";

import { authenticatedAction } from "~/safe-action";

const animalNoteSchema = z.object({
  animalId: z.string(),
  notes: z.string(),
  summary: z.string().optional(),
  type: z.enum([
    "medical",
    "behavioral",
    "general",
    "inKennel",
    "outKennel",
    "approvedActivities",
  ]),
});

const reassignKennelSchema = z.object({
  animalId: z.string(),
  newKennelId: z.string(),
});

const toggleOutOfKennelSchema = z.object({
  animalId: z.string(),
  isOutOfKennel: z.boolean(),
});

// Add Notes Action
export const addAnimalNoteAction = authenticatedAction
  .createServerAction()
  .input(animalNoteSchema)
  .handler(async ({ ctx, input }) => {
    const animal = await db.query.Animals.findFirst({
      where: eq(Animals.id, input.animalId),
    });

    if (!animal) {
      throw new Error("Animal not found");
    }

    const animalNote = await db.insert(AnimalNotes).values({
      animalId: input.animalId,
      createdByUserId: ctx.user.id,
      isActive: true,
      notes: input.notes,
      shelterId: animal.shelterId,
      summary: input.summary,
      type: input.type,
    });

    return { data: animalNote, success: true };
  });

// Reassign Kennel Action
export const reassignKennelAction = authenticatedAction
  .createServerAction()
  .input(reassignKennelSchema)
  .handler(async ({ ctx, input }) => {
    const animal = await db.query.Animals.findFirst({
      where: eq(Animals.id, input.animalId),
    });

    if (!animal) {
      throw new Error("Animal not found");
    }

    // End current kennel occupancy
    if (animal.kennelId) {
      await db
        .update(KennelOccupants)
        .set({
          endedAt: new Date(),
        })
        .where(
          and(
            eq(KennelOccupants.animalId, input.animalId),
            eq(KennelOccupants.kennelId, animal.kennelId),
            isNull(KennelOccupants.endedAt),
          ),
        );
    }

    // Create new kennel occupancy
    await db.insert(KennelOccupants).values({
      animalId: input.animalId,
      createdByUserId: ctx.user.id,
      kennelId: input.newKennelId,
      shelterId: animal.shelterId,
      startedAt: new Date(),
    });

    // Update animal's current kennel
    await db
      .update(Animals)
      .set({
        kennelId: input.newKennelId,
      })
      .where(eq(Animals.id, input.animalId));
  });

// Mark Out of Kennel Action
export const toggleOutOfKennelAction = authenticatedAction
  .createServerAction()
  .input(toggleOutOfKennelSchema)
  .handler(async ({ ctx, input }) => {
    const animal = await db.query.Animals.findFirst({
      where: eq(Animals.id, input.animalId),
    });

    if (!animal) {
      throw new Error("Animal not found");
    }

    // Update animal's out of kennel status
    await db
      .update(Animals)
      .set({
        isOutOfKennel: input.isOutOfKennel,
      })
      .where(eq(Animals.id, input.animalId));

    // Add a note about the status change
    await db.insert(AnimalNotes).values({
      animalId: input.animalId,
      createdByUserId: ctx.user.id,
      isActive: true,
      notes: input.isOutOfKennel ? "Marked out of kennel" : "Marked in kennel",
      shelterId: animal.shelterId,
      type: input.isOutOfKennel ? "outKennel" : "inKennel",
    });

    return { success: true };
  });
