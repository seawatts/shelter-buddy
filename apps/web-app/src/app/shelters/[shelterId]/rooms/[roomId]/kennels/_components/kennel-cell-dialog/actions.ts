"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@acme/db/client";
import {
  AnimalActivities,
  AnimalNotes,
  Animals,
  KennelOccupants,
  Walks,
} from "@acme/db/schema";

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
      with: {
        kennelOccupants: {
          limit: 1,
          orderBy: (kennel, { desc }) => desc(kennel.startedAt),
          where: (kennel, { isNull }) => isNull(kennel.endedAt),
          with: {
            kennel: {
              with: {
                room: true,
              },
            },
          },
        },
      },
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

    revalidatePath(
      `/shelters/${animal.shelterId}/rooms/${animal.kennelOccupants[0]?.kennel.room.id}/kennels`,
    );
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
            kennel: {
              with: {
                room: true,
              },
            },
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

    revalidatePath(
      `/shelters/${animal.shelterId}/rooms/${animal.kennelOccupants[0]?.kennel.room.id}/kennels`,
    );
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
          with: {
            kennel: {
              with: {
                room: true,
              },
            },
          },
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

    revalidatePath(
      `/shelters/${animal.shelterId}/rooms/${animal.kennelOccupants[0]?.kennel.room.id}/kennels`,
    );
    return { success: true };
  });

// Mark Adopted Action
export const markAdoptedAction = authenticatedAction
  .createServerAction()
  .input(z.object({ animalId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const animal = await db.query.Animals.findFirst({
      where: eq(Animals.id, input.animalId),
      with: {
        kennelOccupants: {
          limit: 1,
          orderBy: (kennel, { desc }) => desc(kennel.startedAt),
          where: (kennel, { isNull }) => isNull(kennel.endedAt),
          with: {
            kennel: {
              with: {
                room: true,
              },
            },
          },
        },
      },
    });

    if (!animal) {
      throw new Error("Animal not found");
    }

    // End current kennel occupancy
    await db
      .update(KennelOccupants)
      .set({
        endedAt: new Date(),
      })
      .where(
        and(
          eq(KennelOccupants.animalId, input.animalId),
          isNull(KennelOccupants.endedAt),
        ),
      );

    await db.insert(AnimalActivities).values({
      animalId: input.animalId,
      category: "adopted",
      createdByUserId: ctx.user.id,
      shelterId: animal.shelterId,
      type: "adopted",
    });

    revalidatePath(
      `/shelters/${animal.shelterId}/rooms/${animal.kennelOccupants[0]?.kennel.room.id}/kennels`,
    );
    return { success: true };
  });

// Mark In Foster Action
export const markInFosterAction = authenticatedAction
  .createServerAction()
  .input(z.object({ animalId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const animal = await db.query.Animals.findFirst({
      where: eq(Animals.id, input.animalId),
      with: {
        kennelOccupants: {
          limit: 1,
          orderBy: (kennel, { desc }) => desc(kennel.startedAt),
          where: (kennel, { isNull }) => isNull(kennel.endedAt),
          with: {
            kennel: {
              with: {
                room: true,
              },
            },
          },
        },
      },
    });

    if (!animal) {
      throw new Error("Animal not found");
    }

    // End current kennel occupancy
    await db
      .update(KennelOccupants)
      .set({
        endedAt: new Date(),
      })
      .where(
        and(
          eq(KennelOccupants.animalId, input.animalId),
          isNull(KennelOccupants.endedAt),
        ),
      );

    // Add a note about the foster status
    await db.insert(AnimalActivities).values({
      animalId: input.animalId,
      category: "foster",
      createdByUserId: ctx.user.id,
      shelterId: animal.shelterId,
      type: "started_foster",
    });

    revalidatePath(
      `/shelters/${animal.shelterId}/rooms/${animal.kennelOccupants[0]?.kennel.room.id}/kennels`,
    );
    return { success: true };
  });

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
      with: {
        kennelOccupants: {
          limit: 1,
          orderBy: (kennel, { desc }) => desc(kennel.startedAt),
          where: (kennel, { isNull }) => isNull(kennel.endedAt),
          with: {
            kennel: {
              with: {
                room: true,
              },
            },
          },
        },
      },
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

    revalidatePath(
      `/shelters/${animal.shelterId}/rooms/${animal.kennelOccupants[0]?.kennel.room.id}/kennels`,
    );

    if (input.isNewWalk ?? true) {
      redirect(
        `/shelters/${animal.shelterId}/animals/${animal.id}/walks/${walk.id}/in-progress`,
      );
    } else {
      redirect(
        `/shelters/${animal.shelterId}/animals/${animal.id}/walks/${walk.id}/finished`,
      );
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
      with: {
        kennelOccupants: {
          limit: 1,
          orderBy: (kennel, { desc }) => desc(kennel.startedAt),
          where: (kennel, { isNull }) => isNull(kennel.endedAt),
          with: {
            kennel: {
              with: {
                room: true,
              },
            },
          },
        },
      },
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

    revalidatePath(
      `/shelters/${animal.shelterId}/rooms/${animal.kennelOccupants[0]?.kennel.room.id}/kennels`,
    );
    redirect(
      `/shelters/${animal.shelterId}/animals/${animal.id}/walks/${walk.id}/finished`,
    );
  });
