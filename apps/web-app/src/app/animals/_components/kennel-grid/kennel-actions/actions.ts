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

    await db.insert(AnimalNotes).values({
      animalId: input.animalId,
      createdByUserId: ctx.user.id,
      isActive: true,
      notes: input.notes,
      shelterId: animal.shelterId,
      summary: input.summary,
      type: input.type,
    });

    return { success: true };
  });

// Reassign Kennel Action
export const reassignKennelAction = authenticatedAction
  .createServerAction()
  .input(reassignKennelSchema)
  .handler(async ({ ctx, input }) => {
    const animal = await db.query.Animals.findFirst({
      where: eq(Animals.id, input.animalId),
      with: {
        kennelOccupants: {
          limit: 1,
          orderBy: (kennel, { desc }) => desc(kennel.startedAt),
          where: (kennel, { isNull }) => isNull(kennel.endedAt),
          with: {
            kennel: true,
          },
        },
      },
    });

    if (!animal) {
      throw new Error("Animal not found");
    }

    // End current kennel occupancy
    if (animal.kennelOccupants[0]?.kennelId) {
      await db
        .update(KennelOccupants)
        .set({
          endedAt: new Date(),
        })
        .where(
          and(
            eq(KennelOccupants.animalId, input.animalId),
            eq(KennelOccupants.kennelId, animal.kennelOccupants[0]?.kennelId),
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
  });

// Mark Out of Kennel Action
export const toggleOutOfKennelAction = authenticatedAction
  .createServerAction()
  .input(toggleOutOfKennelSchema)
  .handler(async ({ ctx, input }) => {
    const animal = await db.query.Animals.findFirst({
      where: eq(Animals.id, input.animalId),
      with: {
        kennelOccupants: {
          limit: 1,
          orderBy: (kennel, { desc }) => desc(kennel.startedAt),
          where: (kennel, { isNull }) => isNull(kennel.endedAt),
        },
      },
    });

    if (!animal) {
      throw new Error("Animal not found");
    }

    // Update the current kennel occupant's isOutOfKennel status
    if (animal.kennelOccupants[0]?.id) {
      await db
        .update(KennelOccupants)
        .set({
          isOutOfKennel: input.isOutOfKennel,
        })
        .where(
          and(
            eq(KennelOccupants.animalId, input.animalId),
            eq(KennelOccupants.id, animal.kennelOccupants[0].id),
            isNull(KennelOccupants.endedAt),
          ),
        );
    }

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
