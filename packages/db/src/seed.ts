/* eslint-disable drizzle/enforce-delete-with-where */
import { eq } from "drizzle-orm";
import { seed } from "drizzle-seed";

import { db } from "./client";
import {
  activityCategoryEnum,
  activitySeverityEnum,
  activityTypeEnum,
  AnimalActivities,
  AnimalMedia,
  AnimalNotes,
  animalNoteTypeEnum,
  Animals,
  AnimalTags,
  difficultyLevelEnum,
  genderEnum,
  KennelOccupants,
  KennelRooms,
  Kennels,
  ShelterMembers,
  Shelters,
  userRoleEnum,
  Users,
  walkStatusEnum,
} from "./schema";

// Reset all tables
await db.delete(AnimalActivities);
await db.delete(AnimalMedia);
await db.delete(AnimalNotes);
await db.delete(AnimalTags);
await db.delete(KennelOccupants);
await db.delete(Animals);
await db.delete(Kennels);
await db.delete(KennelRooms);
await db.delete(ShelterMembers);
await db.delete(Users);
await db.delete(Shelters);

await seed(db, {
  AnimalActivities,
  AnimalMedia,
  AnimalNotes,
  AnimalTags,
  Animals,
  KennelOccupants,
  KennelRooms,
  Kennels,
  ShelterMembers,
  Shelters,
  Users,
}).refine((funcs) => ({
  AnimalActivities: {
    columns: {
      category: funcs.valuesFromArray({
        values: activityCategoryEnum.enumValues,
      }),
      metadata: funcs.default({ defaultValue: {} }),
      notes: funcs.loremIpsum(),
      severity: funcs.valuesFromArray({
        values: activitySeverityEnum.enumValues,
      }),
      type: funcs.valuesFromArray({ values: activityTypeEnum.enumValues }),
      value: funcs.int({ maxValue: 10, minValue: 1 }),
    },
    count: 100,
  },
  AnimalMedia: {
    columns: {
      default: funcs.boolean(),
      metadata: funcs.default({ defaultValue: {} }),
      s3Path: funcs.default({ defaultValue: "https://picsum.photos/800/600" }),
      thumbnailUrl: funcs.default({
        defaultValue: "https://picsum.photos/200/300",
      }),
      type: funcs.default({ defaultValue: "image" }),
    },
    count: 60,
  },
  AnimalNotes: {
    columns: {
      isActive: funcs.boolean(),
      notes: funcs.loremIpsum(),
      summary: funcs.loremIpsum({ sentencesCount: 1 }),
      type: funcs.valuesFromArray({
        values: animalNoteTypeEnum.enumValues,
      }),
    },
    count: 50,
  },
  AnimalTags: {
    columns: {
      isActive: funcs.boolean(),
      tag: funcs.valuesFromArray({
        values: ["first", "last"],
      }),
    },
    count: 4,
  },
  Animals: {
    columns: {
      birthDate: funcs.date({
        maxDate: "2024-01-01",
        minDate: "2020-01-01",
      }),
      breed: funcs.default({ defaultValue: "Mixed" }),
      difficultyLevel: funcs.valuesFromArray({
        values: difficultyLevelEnum.enumValues,
      }),
      gender: funcs.valuesFromArray({ values: genderEnum.enumValues }),
      isFido: funcs.boolean(),
      isOutOfKennel: funcs.boolean(),
      name: funcs.firstName(),
      weight: funcs.number({ maxValue: 100, minValue: 5, precision: 2 }),
    },
    count: 30,
  },
  KennelOccupants: {
    columns: {
      endedAt: funcs.default({ defaultValue: null }),
      startedAt: funcs.date({
        maxDate: "2024-02-14",
        minDate: "2024-01-01",
      }),
    },
    count: 25,
  },
  KennelRooms: {
    columns: {
      gridX: funcs.int(),
      gridY: funcs.int(),
      name: funcs.valuesFromArray({
        values: ["ISO", "Main", "Medical"],
      }),
    },
    count: 3,
  },
  Kennels: {
    columns: {
      gridX: funcs.int(),
      gridY: funcs.int(),
      lastCleanedAt: funcs.date({
        maxDate: "2024-02-14",
        minDate: "2024-01-01",
      }),
      maintenanceStatus: funcs.valuesFromArray({
        values: ["good"],
      }),
      name: funcs.intPrimaryKey(),
      status: funcs.valuesFromArray({
        values: ["available"],
      }),
      type: funcs.valuesFromArray({
        values: ["standard"],
      }),
    },
    count: 32,
  },
  ShelterMembers: {
    columns: {
      role: funcs.valuesFromArray({ values: userRoleEnum.enumValues }),
    },
    count: 10,
  },
  Shelters: {
    columns: {
      name: funcs.companyName(),
      themeConfig: funcs.default({
        defaultValue: {
          colors: {
            accent: "220 90% 75%",
            primary: "220 90% 45%",
            secondary: "220 20% 92%",
          },
        },
      }),
    },
    count: 1,
  },
  Users: {
    columns: {
      email: funcs.email(),
      firstName: funcs.firstName(),
      id: funcs.default({ defaultValue: "user_2qXtp8yCYqltHXZTFvFwZYeilwz" }),
      lastName: funcs.lastName(),
      online: funcs.boolean(),
    },
    count: 1,
  },
  Walks: {
    columns: {
      notes: funcs.loremIpsum(),
      status: funcs.valuesFromArray({ values: walkStatusEnum.enumValues }),
      summary: funcs.loremIpsum({ sentencesCount: 1 }),
      walkDifficulty: funcs.int({ maxValue: 5, minValue: 1 }),
    },
    count: 40,
  },
}));

// Update kennel grid coordinates
const kennels = await db.select().from(Kennels).orderBy(Kennels.name);

for (const [index, kennel] of kennels.entries()) {
  const kennelNumber = index + 1; // Start from 1 up to 32
  const gridX = kennelNumber <= 16 ? 0 : 1;
  const gridY =
    kennelNumber <= 16
      ? 15 - (kennelNumber - 1) // Left column: 15 down to 0
      : kennelNumber - 17; // Right column: 0 up to 15

  await db
    .update(Kennels)
    .set({
      gridX,
      gridY,
      name: String(kennelNumber),
    })
    .where(eq(Kennels.id, kennel.id));
}

// eslint-disable-next-line unicorn/no-process-exit
process.exit(0);
