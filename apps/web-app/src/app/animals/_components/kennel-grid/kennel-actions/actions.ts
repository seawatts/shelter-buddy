"use server";

import { revalidatePath } from "next/cache";
import { Image } from "@boundaryml/baml";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@acme/db/client";
import {
  AnimalMedia,
  AnimalNotes,
  Animals,
  KennelOccupants,
  ShelterMembers,
} from "@acme/db/schema";

import { authenticatedAction } from "~/safe-action";
import { b } from "../../../../../../../../baml_client";

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

const createAnimalSchema = z.object({
  approvedActivities: z
    .array(
      z.object({
        activity: z.string(),
        isApproved: z.boolean(),
      }),
    )
    .optional(),
  birthDate: z.date().optional(),
  breed: z.string(),
  difficultyLevel: z.enum(["Yellow", "Purple", "Red"]),
  equipmentNotes: z
    .object({
      inKennel: z.string().optional(),
      outOfKennel: z.string().optional(),
    })
    .optional(),
  gender: z.enum(["male", "female"]),
  generalNotes: z.string().optional(),
  headshot: z.string().optional(),
  id: z.string().optional(),
  isFido: z.boolean().optional(),
  kennelId: z.string(),
  name: z.string(),
  weight: z.number().optional(),
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

// Create Animal Action
export const createAnimalAction = authenticatedAction
  .createServerAction()
  .input(createAnimalSchema, {
    type: "formData",
  })
  .handler(async ({ ctx, input }) => {
    // Get the user's shelter ID
    const shelterMember = await db.query.ShelterMembers.findFirst({
      where: eq(ShelterMembers.userId, ctx.user.id),
    });

    if (!shelterMember) {
      throw new Error("User is not a member of any shelter");
    }

    // Create the animal
    const [animal] = await db
      .insert(Animals)
      .values({
        birthDate: input.birthDate,
        breed: input.breed,
        createdByUserId: ctx.user.id,
        difficultyLevel: input.difficultyLevel,
        externalId: input.id,
        gender: input.gender,
        isFido: input.isFido ?? false,
        name: input.name,
        shelterId: shelterMember.shelterId,
        weight: input.weight ?? null,
      })
      .returning();

    if (!animal) {
      throw new Error("Failed to create animal");
    }

    // Create kennel occupant record
    await db.insert(KennelOccupants).values({
      animalId: animal.id,
      createdByUserId: ctx.user.id,
      kennelId: input.kennelId,
      shelterId: shelterMember.shelterId,
      startedAt: new Date(),
    });

    // Create general notes if provided
    if (input.generalNotes) {
      await db.insert(AnimalNotes).values({
        animalId: animal.id,
        createdByUserId: ctx.user.id,
        isActive: true,
        notes: input.generalNotes,
        shelterId: shelterMember.shelterId,
        type: "general",
      });
    }

    // Create equipment notes if provided
    if (input.equipmentNotes?.inKennel) {
      await db.insert(AnimalNotes).values({
        animalId: animal.id,
        createdByUserId: ctx.user.id,
        isActive: true,
        notes: input.equipmentNotes.inKennel,
        shelterId: shelterMember.shelterId,
        type: "inKennel",
      });
    }

    if (input.equipmentNotes?.outOfKennel) {
      await db.insert(AnimalNotes).values({
        animalId: animal.id,
        createdByUserId: ctx.user.id,
        isActive: true,
        notes: input.equipmentNotes.outOfKennel,
        shelterId: shelterMember.shelterId,
        type: "outKennel",
      });
    }

    // Create approved activities notes if provided
    if (input.approvedActivities?.length) {
      const activitiesText = input.approvedActivities
        .map(
          (activity) =>
            `${activity.activity}: ${activity.isApproved ? "Approved" : "Not Approved"}`,
        )
        .join("\n");

      await db.insert(AnimalNotes).values({
        animalId: animal.id,
        createdByUserId: ctx.user.id,
        isActive: true,
        notes: activitiesText,
        shelterId: shelterMember.shelterId,
        type: "approvedActivities",
      });
    }

    // Create headshot media if provided
    if (input.headshot) {
      await db.insert(AnimalMedia).values({
        animalId: animal.id,
        createdByUserId: ctx.user.id,
        default: true,
        metadata: {},
        type: "image",
        url: input.headshot,
      });
    }

    revalidatePath("/animals");
    return { animalId: animal.id, success: true };
  });

export const analyzeIntakeFormAction = authenticatedAction
  .createServerAction()
  .input(z.object({ imageUrl: z.string() }))
  .handler(async ({ input }) => {
    try {
      const image = Image.fromBase64("image/png", input.imageUrl);

      const formData = await b.ExtractIntakeForm(image);

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
