"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import type { AnimalNoteType } from "@acme/db/schema";
import { db } from "@acme/db/client";
import {
  AnimalMedia,
  AnimalNotes,
  Animals,
  KennelOccupants,
  Kennels,
  ShelterMembers,
} from "@acme/db/schema";

import { authenticatedAction } from "~/safe-action";

const createAnimalSchema = z.object({
  animalId: z.string().optional(),
  approvedActivities: z
    .array(
      z.object({
        activity: z.string().optional(),
        isApproved: z.boolean().optional(),
      }),
    )
    .optional(),
  birthDate: z.date().optional(),
  breed: z.string().optional(),
  difficultyLevel: z.enum(["Yellow", "Purple", "Red"]),
  equipmentNotes: z
    .object({
      inKennel: z.string().optional(),
      outOfKennel: z.string().optional(),
    })
    .optional(),
  externalId: z.string().optional(),
  gender: z.enum(["male", "female"]),
  generalNotes: z.string().optional(),
  intakeFormImageHeight: z.number().optional(),
  intakeFormImagePath: z.string().optional(),
  intakeFormImageSize: z.number().optional(),
  intakeFormImageWidth: z.number().optional(),
  isFido: z.boolean().optional(),
  kennelId: z.string(),
  name: z.string(),
  shelterId: z.string(),
  staffLeashUp: z.boolean().optional(),
  staffReturn: z.boolean().optional(),
  weight: z.number().optional(),
});

// Create Animal Action
export const createAnimalAction = authenticatedAction
  .createServerAction()
  .input(createAnimalSchema)
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
        externalId: input.externalId,
        gender: input.gender,
        isFido: Boolean(input.isFido),
        name: input.name,
        shelterId: input.shelterId,
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

    // Create staff requirement notes if needed
    if (input.staffLeashUp || input.staffReturn) {
      const staffRequirements: Omit<
        AnimalNoteType,
        "id" | "createdAt" | "updatedAt" | "summary" | "walkId"
      >[] = [];

      if (input.staffLeashUp) {
        staffRequirements.push({
          animalId: animal.id,
          createdByUserId: ctx.user.id,
          isActive: true,
          notes: "Staff required for leash up",
          shelterId: shelterMember.shelterId,
          type: "staffRequirement",
        });
      }

      if (input.staffReturn) {
        staffRequirements.push({
          animalId: animal.id,
          createdByUserId: ctx.user.id,
          isActive: true,
          notes: "Staff required for return",
          shelterId: shelterMember.shelterId,
          type: "staffRequirement",
        });
      }

      if (staffRequirements.length > 0) {
        await db.insert(AnimalNotes).values(staffRequirements);
      }
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
    if (input.intakeFormImagePath) {
      await db.insert(AnimalMedia).values({
        animalId: animal.id,
        createdByUserId: ctx.user.id,
        default: true,
        height: input.intakeFormImageHeight ?? 0,
        metadata: {},
        s3Path: input.intakeFormImagePath,
        shelterId: shelterMember.shelterId,
        sizeBytes: input.intakeFormImageSize ?? 0,
        type: "image",
        width: input.intakeFormImageWidth ?? 0,
      });
    }

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

    // Get the kennel's room for revalidation
    const kennel = await db.query.Kennels.findFirst({
      where: eq(Kennels.id, input.kennelId),
      with: {
        room: true,
      },
    });

    if (!kennel) {
      throw new Error("Kennel not found");
    }

    revalidatePath(
      `/shelters/${shelterMember.shelterId}/rooms/${kennel.room.id}/kennels`,
    );
  });
