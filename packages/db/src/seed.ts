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
  Kennels,
  kennelSizeEnum,
  kennelStatusEnum,
  kennelTypeEnum,
  maintenanceStatusEnum,
  ShelterMembers,
  Shelters,
  ShortUrl,
  userRoleEnum,
  Users,
  Walks,
  walkStatusEnum,
} from "./schema";

async function main() {
  await seed(db, {
    AnimalActivities,
    AnimalMedia,
    AnimalNotes,
    AnimalTags,
    Animals,
    KennelOccupants,
    Kennels,
    ShelterMembers,
    Shelters,
    ShortUrl,
    Users,
    Walks,
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
        thumbnailUrl: funcs.default({
          defaultValue: "https://picsum.photos/200/300",
        }),
        type: funcs.default({ defaultValue: "image" }),
        url: funcs.default({ defaultValue: "https://picsum.photos/800/600" }),
      },
      count: 60,
    },
    AnimalNotes: {
      columns: {
        isActive: funcs.boolean(),
        notes: funcs.loremIpsum(),
        summary: funcs.loremIpsum({ sentencesCount: 1 }),
        type: funcs.valuesFromArray({ values: animalNoteTypeEnum.enumValues }),
      },
      count: 50,
    },
    AnimalTags: {
      columns: {
        isActive: funcs.boolean(),
        tag: funcs.default({ defaultValue: "tag" }),
      },
      count: 80,
    },
    Animals: {
      columns: {
        birthDate: funcs.date({ maxDate: "2024-01-01", minDate: "2020-01-01" }),
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
        endedAt: funcs.date({ maxDate: "2024-02-14", minDate: "2024-01-01" }),
        startedAt: funcs.date({ maxDate: "2024-02-14", minDate: "2024-01-01" }),
      },
      count: 25,
    },
    Kennels: {
      columns: {
        features: funcs.default({
          defaultValue: ["heated", "covered", "indoor"],
        }),
        location: funcs.streetAddress(),
        maintenanceStatus: funcs.valuesFromArray({
          values: maintenanceStatusEnum.enumValues,
        }),
        name: funcs.companyName(),
        notes: funcs.loremIpsum(),
        size: funcs.valuesFromArray({ values: kennelSizeEnum.enumValues }),
        status: funcs.valuesFromArray({ values: kennelStatusEnum.enumValues }),
        type: funcs.valuesFromArray({ values: kennelTypeEnum.enumValues }),
      },
      count: 20,
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
      count: 2,
    },
    Users: {
      columns: {
        email: funcs.email(),
        firstName: funcs.firstName(),
        lastName: funcs.lastName(),
        online: funcs.boolean(),
      },
      count: 20,
    },
    Walks: {
      columns: {
        endedAt: funcs.date({ maxDate: "2024-02-14", minDate: "2024-01-01" }),
        notes: funcs.loremIpsum(),
        startedAt: funcs.date({ maxDate: "2024-02-14", minDate: "2024-01-01" }),
        status: funcs.valuesFromArray({ values: walkStatusEnum.enumValues }),
        summary: funcs.loremIpsum({ sentencesCount: 1 }),
        walkDifficulty: funcs.int({ maxValue: 5, minValue: 1 }),
      },
      count: 40,
    },
  }));
}

(() => {
  main().catch(console.error);
})();
