"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@acme/db/client";
import {
  activityTypeEnum,
  AnimalActivities,
  AnimalNotes,
  Walks,
} from "@acme/db/schema";

import { authenticatedAction } from "~/safe-action";

interface TranscriptionResult {
  notes: string;
  activities: string[];
}

type WalkActivityType = Exclude<
  (typeof activityTypeEnum.enumValues)[number],
  | "adopted"
  | "started_foster"
  | "ended_foster"
  | "started_in_kennel"
  | "ended_in_kennel"
>;

// Activity type to category mapping
const ACTIVITY_CATEGORIES: Record<
  WalkActivityType,
  {
    category:
      | "bathroom"
      | "play"
      | "training"
      | "incident"
      | "safety"
      | "health"
      | "behavior";
    severity: "info" | "low" | "medium" | "high" | "critical";
  }
> = {
  accident: { category: "bathroom", severity: "low" },
  aggressive: { category: "incident", severity: "high" },
  bite: { category: "incident", severity: "critical" },
  bloody_stool: { category: "health", severity: "high" },
  bolting_tendency: { category: "safety", severity: "high" },
  calm_in_new_places: { category: "behavior", severity: "info" },
  checks_in: { category: "behavior", severity: "info" },
  coughing: { category: "health", severity: "medium" },
  diarrhea: { category: "health", severity: "high" },
  dog_reactive: { category: "incident", severity: "medium" },
  easy_in: { category: "behavior", severity: "info" },
  easy_out: { category: "behavior", severity: "info" },
  eats_everything: { category: "safety", severity: "medium" },
  eye_discharge: { category: "health", severity: "medium" },
  focused_on_handler: { category: "behavior", severity: "info" },
  frequent_urination: { category: "health", severity: "medium" },
  good_behavior: { category: "behavior", severity: "info" },
  hot_spots: { category: "health", severity: "medium" },
  human_reactive: { category: "incident", severity: "high" },
  jumpy: { category: "safety", severity: "medium" },
  knows_123_treat: { category: "behavior", severity: "info" },
  knows_come: { category: "behavior", severity: "info" },
  knows_leave: { category: "behavior", severity: "info" },
  knows_sit: { category: "behavior", severity: "info" },
  knows_stay: { category: "behavior", severity: "info" },
  knows_wait: { category: "behavior", severity: "info" },
  leash_trained: { category: "behavior", severity: "info" },
  likes_pets: { category: "behavior", severity: "info" },
  likes_sniffing: { category: "behavior", severity: "info" },
  limping: { category: "health", severity: "high" },
  loose_stool: { category: "health", severity: "medium" },
  mouthy: { category: "safety", severity: "medium" },
  no_touches: { category: "safety", severity: "medium" },
  nose_discharge: { category: "health", severity: "medium" },
  pee: { category: "bathroom", severity: "info" },
  played_ball: { category: "play", severity: "info" },
  played_fetch: { category: "play", severity: "info" },
  played_tug: { category: "play", severity: "info" },
  plays_bow: { category: "behavior", severity: "info" },
  poop: { category: "bathroom", severity: "info" },
  pulled: { category: "incident", severity: "low" },
  pulls_hard: { category: "safety", severity: "medium" },
  resource_guarding: { category: "safety", severity: "high" },
  scratching: { category: "health", severity: "low" },
  shaking_head: { category: "health", severity: "medium" },
  shares_toys: { category: "behavior", severity: "info" },
  sneezing: { category: "health", severity: "medium" },
  takes_treats_gently: { category: "behavior", severity: "info" },
  training: { category: "training", severity: "info" },
  treats: { category: "training", severity: "info" },
  vomit: { category: "health", severity: "high" },
} as const;

export async function transcribeAudio(audioFile: File) {
  try {
    console.log("Transcribing audio...");
    const arrayBuffer = await audioFile.arrayBuffer();

    const result = await generateText({
      messages: [
        {
          content: [
            { text: "What is the audio saying?", type: "text" },
            {
              data: arrayBuffer,
              mimeType: audioFile.type,
              type: "file",
            },
          ],
          role: "user",
        },
      ],
      model: openai("gpt-4o-audio-preview"),
    });

    console.log("Transcription complete:", result);

    return {
      object: {
        activities: [],
        notes: result.text || "",
      } satisfies TranscriptionResult,
      success: true,
    };
  } catch (error) {
    console.error("Transcription error:", error);
    return { error: "Failed to transcribe audio", success: false };
  }
}

export const finishWalkAction = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      activities: z.record(z.enum(activityTypeEnum.enumValues), z.boolean()),
      endedAt: z.date(),
      notes: z.string().optional(),
      startedAt: z.date(),
      walkDifficultyLevel: z.number().min(1).max(5),
      walkId: z.string(),
    }),
  )
  .handler(async ({ ctx, input }) => {
    const walk = await db.query.Walks.findFirst({
      where: eq(Walks.id, input.walkId),
    });

    if (!walk) {
      throw new Error("Walk not found");
    }

    await db
      .update(Walks)
      .set({
        endedAt: input.endedAt,
        startedAt: input.startedAt,
        status: "completed",
        walkDifficultyLevel: input.walkDifficultyLevel,
      })
      .where(eq(Walks.id, input.walkId));

    // Create activity records for each selected activity
    const selectedActivities = Object.entries(input.activities)
      .filter(([, isActive]) => isActive)
      .map(([activity]) => activity as keyof typeof ACTIVITY_CATEGORIES);

    if (selectedActivities.length > 0) {
      await db.insert(AnimalActivities).values(
        selectedActivities.map((activity) => ({
          animalId: walk.animalId,
          category: ACTIVITY_CATEGORIES[activity].category,
          createdByUserId: ctx.user.id,
          severity: ACTIVITY_CATEGORIES[activity].severity,
          shelterId: walk.shelterId,
          type: activity,
          walkId: walk.id,
        })),
      );
    }

    if (input.notes) {
      // Add a note about the walk
      await db.insert(AnimalNotes).values({
        animalId: walk.animalId,
        createdByUserId: ctx.user.id,
        isActive: true,
        notes: input.notes,
        shelterId: walk.shelterId,
        type: "general",
        walkId: walk.id,
      });
    }

    revalidatePath(`/animals`);
    redirect(`/animals`);
    return { success: true };
  });

const endWalkSchema = z.object({
  walkId: z.string(),
});

export const endWalkAction = authenticatedAction
  .createServerAction()
  .input(endWalkSchema)
  .handler(async ({ input }) => {
    const walk = await db.query.Walks.findFirst({
      where: and(eq(Walks.id, input.walkId), isNull(Walks.endedAt)),
    });

    if (!walk) {
      throw new Error("Walk not found or already finished");
    }

    // Update walk with end time and status
    await db
      .update(Walks)
      .set({
        endedAt: new Date(),
        status: "completed",
      })
      .where(eq(Walks.id, input.walkId));

    revalidatePath(`/animals/walks/${input.walkId}/finished`);
    revalidatePath(`/animals`);
    redirect(`/animals/walks/${input.walkId}/finished`);
    return { success: true };
  });
