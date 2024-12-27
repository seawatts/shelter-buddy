import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { createId } from "@acme/id";

export const userRoleEnum = pgEnum("userRole", ["admin", "superAdmin", "user"]);

export const UserRoleType = z.enum(userRoleEnum.enumValues).Enum;

// Define the theme configuration type
export const ThemeConfigSchema = z.object({
  colors: z.object({
    accent: z.string(),
    background: z.string().optional(),
    border: z.string().optional(),
    foreground: z.string().optional(),
    muted: z.string().optional(),
    primary: z.string(),
    secondary: z.string(),
  }),
  darkMode: z
    .object({
      accent: z.string(),
      background: z.string().optional(),
      border: z.string().optional(),
      foreground: z.string().optional(),
      muted: z.string().optional(),
      primary: z.string(),
      secondary: z.string(),
    })
    .optional(),
});

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

export const Users = pgTable("user", {
  avatarUrl: text("avatarUrl"),
  clerkId: text("clerkId").unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  email: text("email").notNull().unique(),
  firstName: text("firstName"),
  id: varchar("id", { length: 128 }).notNull().primaryKey(),
  lastName: text("lastName"),
  online: boolean("online").default(false).notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
});

export const UsersRelations = relations(Users, ({ many }) => ({
  createdActivities: many(AnimalActivities),
  createdAnimalMedia: many(AnimalMedia),
  createdAnimalNotes: many(AnimalNotes),
  createdAnimalTags: many(AnimalTags),
  createdAnimals: many(Animals),
  createdShelterMembers: many(ShelterMembers),
  createdWalks: many(Walks),
  shelterMembers: many(ShelterMembers),
  walks: many(Walks),
}));

export type UserType = typeof Users.$inferSelect;

export const CreateUserSchema = createInsertSchema(Users, {
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  online: z.boolean(),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
});

export const Shelters = pgTable("shelter", {
  clerkOrgId: text("clerkOrgId"),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  createdByUserId: varchar("createdByUserId")
    .references(() => Users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId({ prefix: "shelter" }))
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  themeConfig: json("themeConfig")
    .$type<ThemeConfig>()
    .notNull()
    .$default(() => ({
      colors: {
        accent: "220 90% 75%",
        primary: "220 90% 45%",
        secondary: "220 20% 92%",
      },
    })),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
});

export type ShelterType = typeof Shelters.$inferSelect;

export const SheltersRelations = relations(Shelters, ({ one, many }) => ({
  animals: many(Animals),
  createdByUser: one(Users, {
    fields: [Shelters.createdByUserId],
    references: [Users.id],
  }),
  kennels: many(Kennels),
  shelterMembers: many(ShelterMembers),
}));

export const updateShelterSchema = createInsertSchema(Shelters, {}).omit({
  createdAt: true,
  createdByUserId: true,
  id: true,
  updatedAt: true,
});

// Shelter Members Table
export const ShelterMembers = pgTable("shelter_members", {
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  createdByUserId: varchar("createdByUserId")
    .references(() => Users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId({ prefix: "member" }))
    .notNull()
    .primaryKey(),
  role: userRoleEnum("role").default("user").notNull(),
  shelterId: varchar("shelterId")
    .references(() => Shelters.id, {
      onDelete: "cascade",
    })
    .notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
  userId: varchar("userId")
    .references(() => Users.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export type ShelterMembersType = typeof ShelterMembers.$inferSelect & {
  user?: UserType;
  shelter?: ShelterType;
};

export const ShelterMembersRelations = relations(ShelterMembers, ({ one }) => ({
  createdByUser: one(Users, {
    fields: [ShelterMembers.createdByUserId],
    references: [Users.id],
    relationName: "createdByUser",
  }),
  shelter: one(Shelters, {
    fields: [ShelterMembers.shelterId],
    references: [Shelters.id],
  }),
  user: one(Users, {
    fields: [ShelterMembers.userId],
    references: [Users.id],
    relationName: "user",
  }),
}));

export const ShortUrl = pgTable("short_url", {
  code: text("code").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId({ prefix: "url" }))
    .notNull()
    .primaryKey(),
  redirectUrl: text("redirectUrl").notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
});

// Animal Related Enums
export const kennelSizeEnum = pgEnum("kennelSize", [
  "small",
  "medium",
  "large",
]);
export const kennelTypeEnum = pgEnum("kennelType", [
  "standard",
  "isolation",
  "senior",
  "quiet",
]);
export const kennelStatusEnum = pgEnum("kennelStatus", [
  "available",
  "occupied",
  "maintenance",
  "reserved",
]);
export const maintenanceStatusEnum = pgEnum("maintenanceStatus", [
  "good",
  "needs-repair",
  "under-maintenance",
]);
export const difficultyLevelEnum = pgEnum("difficultyLevel", [
  "Yellow",
  "Purple",
  "Red",
]);
export const walkStatusEnum = pgEnum("walkStatus", [
  "completed",
  "in_progress",
  "not_started",
]);

export const activityTypeEnum = pgEnum("activityType", [
  // Bathroom
  "pee",
  "poop",
  "accident",
  // Play
  "played_ball",
  "played_tug",
  "played_fetch",
  // Training
  "training",
  "treats",
  // Incidents
  "pulled",
  "dog_reactive",
  "human_reactive",
  "aggressive",
  "bite",
  // Safety
  "pulls_hard",
  "jumpy",
  "mouthy",
  "bolting_tendency",
  "resource_guarding",
  "eats_everything",
  "no_touches",
  // Health
  "vomit",
  "diarrhea",
  "limping",
  "frequent_urination",
  "loose_stool",
  "bloody_stool",
  "scratching",
  "shaking_head",
  "coughing",
  "sneezing",
  "eye_discharge",
  "nose_discharge",
  "hot_spots",
  // Positive Behaviors
  "likes_sniffing",
  "likes_pets",
  "good_behavior",
  "leash_trained",
  "checks_in",
  "easy_out",
  "easy_in",
  "plays_bow",
  "shares_toys",
  "takes_treats_gently",
  "knows_sit",
  "knows_123_treat",
  "knows_stay",
  "knows_leave",
  "knows_wait",
  "knows_come",
  "focused_on_handler",
  "calm_in_new_places",
]);

export const activityCategoryEnum = pgEnum("activityCategory", [
  "bathroom",
  "play",
  "training",
  "incident",
  "safety",
  "health",
  "behavior",
]);

export const activitySeverityEnum = pgEnum("activitySeverity", [
  "info",
  "low",
  "medium",
  "high",
  "critical",
]);

// Animal Related Enums
export const animalNoteTypeEnum = pgEnum("animalNoteType", [
  "medical",
  "behavioral",
  "general",
  "inKennel",
  "outKennel",
  "approvedActivities",
]);

export const genderEnum = pgEnum("gender", ["male", "female"]);

// Kennels Table
export const Kennels = pgTable("kennel", {
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  features: json("features").$type<string[]>(),
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId({ prefix: "kennel" }))
    .notNull()
    .primaryKey(),
  lastCleanedAt: timestamp("lastCleanedAt", {
    mode: "date",
    withTimezone: true,
  }),
  location: text("location"),
  maintenanceStatus: maintenanceStatusEnum("maintenanceStatus").default("good"),
  name: text("name").notNull(),
  notes: text("notes"),
  shelterId: varchar("shelterId")
    .references(() => Shelters.id, {
      onDelete: "cascade",
    })
    .notNull(),
  size: kennelSizeEnum("size").notNull(),
  status: kennelStatusEnum("status").default("available").notNull(),
  type: kennelTypeEnum("type").notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
});

// Kennel Occupants Table
export const KennelOccupants = pgTable("kennel_occupant", {
  animalId: varchar("animalId")
    .references(() => Animals.id, {
      onDelete: "cascade",
    })
    .notNull(),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  createdByUserId: varchar("createdByUserId")
    .references(() => Users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  endedAt: timestamp("endedAt", {
    mode: "date",
    withTimezone: true,
  }),
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId({ prefix: "occupant" }))
    .notNull()
    .primaryKey(),
  kennelId: varchar("kennelId")
    .references(() => Kennels.id, {
      onDelete: "cascade",
    })
    .notNull(),
  shelterId: varchar("shelterId")
    .references(() => Shelters.id, {
      onDelete: "cascade",
    })
    .notNull(),
  startedAt: timestamp("startedAt", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
});

// Relations
export const KennelsRelations = relations(Kennels, ({ one, many }) => ({
  currentAnimal: one(Animals, {
    fields: [Kennels.id],
    references: [Animals.kennelId],
  }),
  occupants: many(KennelOccupants),
  shelter: one(Shelters, {
    fields: [Kennels.shelterId],
    references: [Shelters.id],
  }),
}));

export const KennelOccupantsRelations = relations(
  KennelOccupants,
  ({ one }) => ({
    animal: one(Animals, {
      fields: [KennelOccupants.animalId],
      references: [Animals.id],
    }),
    createdByUser: one(Users, {
      fields: [KennelOccupants.createdByUserId],
      references: [Users.id],
    }),
    kennel: one(Kennels, {
      fields: [KennelOccupants.kennelId],
      references: [Kennels.id],
    }),
    shelter: one(Shelters, {
      fields: [KennelOccupants.shelterId],
      references: [Shelters.id],
    }),
  }),
);

// Animals Table
export const Animals = pgTable("animal", {
  birthDate: timestamp("birthDate", {
    mode: "date",
    withTimezone: true,
  }),
  breed: text("breed"),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  createdByUserId: varchar("createdByUserId")
    .references(() => Users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  difficultyLevel: difficultyLevelEnum("difficultyLevel").notNull(),
  gender: genderEnum("gender").notNull(),
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId({ prefix: "animal" }))
    .notNull()
    .primaryKey(),
  isFido: boolean("isFido").default(false).notNull(),
  isOutOfKennel: boolean("isOutOfKennel").default(false).notNull(),
  kennelId: varchar("kennelId").references(() => Kennels.id),
  name: text("name").notNull(),
  shelterId: varchar("shelterId")
    .references(() => Shelters.id, {
      onDelete: "cascade",
    })
    .notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
  weight: decimal("weight", { precision: 5, scale: 2 }),
});

// Animal Tags Table
export const AnimalTags = pgTable("animal_tag", {
  animalId: varchar("animalId")
    .references(() => Animals.id, {
      onDelete: "cascade",
    })
    .notNull(),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  createdByUserId: varchar("createdByUserId")
    .references(() => Users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId({ prefix: "tag" }))
    .notNull()
    .primaryKey(),
  isActive: boolean("isActive").default(true).notNull(),
  shelterId: varchar("shelterId")
    .references(() => Shelters.id, {
      onDelete: "cascade",
    })
    .notNull(),
  tag: text("tag").notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
  walkId: varchar("walkId").references(() => Walks.id, {
    onDelete: "cascade",
  }),
});

// Animal Media Table
export const AnimalMedia = pgTable("animal_media", {
  animalId: varchar("animalId")
    .references(() => Animals.id, {
      onDelete: "cascade",
    })
    .notNull(),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  createdByUserId: varchar("createdByUserId")
    .references(() => Users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  default: boolean("default").default(false).notNull(),
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId({ prefix: "media" }))
    .notNull()
    .primaryKey(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  thumbnailUrl: text("thumbnailUrl"),
  type: text("type").notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
  url: text("url").notNull(),
});

// Animal Notes Table
export const AnimalNotes = pgTable("animal_note", {
  animalId: varchar("animalId")
    .references(() => Animals.id, {
      onDelete: "cascade",
    })
    .notNull(),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  createdByUserId: varchar("createdByUserId")
    .references(() => Users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId({ prefix: "note" }))
    .notNull()
    .primaryKey(),
  isActive: boolean("isActive").default(true).notNull(),
  notes: text("notes").notNull(),
  shelterId: varchar("shelterId")
    .references(() => Shelters.id, {
      onDelete: "cascade",
    })
    .notNull(),
  summary: text("summary"),
  type: animalNoteTypeEnum("type").notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
});

export const AnimalNotesRelations = relations(AnimalNotes, ({ one }) => ({
  animal: one(Animals, {
    fields: [AnimalNotes.animalId],
    references: [Animals.id],
  }),
  createdByUser: one(Users, {
    fields: [AnimalNotes.createdByUserId],
    references: [Users.id],
  }),
  shelter: one(Shelters, {
    fields: [AnimalNotes.shelterId],
    references: [Shelters.id],
  }),
}));

// Walks Table
export const Walks = pgTable("walk", {
  animalId: varchar("animalId")
    .references(() => Animals.id, {
      onDelete: "cascade",
    })
    .notNull(),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  endedAt: timestamp("endedAt", {
    mode: "date",
    withTimezone: true,
  }),
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId({ prefix: "walk" }))
    .notNull()
    .primaryKey(),
  notes: text("notes"),
  startedAt: timestamp("startedAt", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  status: walkStatusEnum("status").default("not_started").notNull(),
  summary: text("summary"),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
  userId: varchar("userId")
    .references(() => Users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  walkDifficulty: integer("walkDifficulty").notNull(),
});

// Activities Table (can be associated with a walk or standalone)
export const AnimalActivities = pgTable("animal_activity", {
  animalId: varchar("animalId")
    .references(() => Animals.id, {
      onDelete: "cascade",
    })
    .notNull(),
  category: activityCategoryEnum("category").notNull(),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  createdByUserId: varchar("createdByUserId")
    .references(() => Users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId({ prefix: "activity" }))
    .notNull()
    .primaryKey(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  notes: text("notes"),
  severity: activitySeverityEnum("severity").default("info").notNull(),
  type: activityTypeEnum("type").notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => new Date()),
  value: integer("value"),
  walkId: varchar("walkId").references(() => Walks.id, {
    onDelete: "cascade",
  }),
});

export const AnimalsRelations = relations(Animals, ({ one, many }) => ({
  activities: many(AnimalActivities),
  createdByUser: one(Users, {
    fields: [Animals.createdByUserId],
    references: [Users.id],
  }),
  kennel: one(Kennels, {
    fields: [Animals.kennelId],
    references: [Kennels.id],
  }),
  kennelHistory: many(KennelOccupants),
  media: many(AnimalMedia),
  notes: many(AnimalNotes),
  shelter: one(Shelters, {
    fields: [Animals.shelterId],
    references: [Shelters.id],
  }),
  tags: many(AnimalTags),
  walks: many(Walks),
}));

export const WalksRelations = relations(Walks, ({ one, many }) => ({
  activities: many(AnimalActivities),
  animal: one(Animals, {
    fields: [Walks.animalId],
    references: [Animals.id],
  }),
  tags: many(AnimalTags),
  user: one(Users, {
    fields: [Walks.userId],
    references: [Users.id],
  }),
}));

export const ActivitiesRelations = relations(AnimalActivities, ({ one }) => ({
  animal: one(Animals, {
    fields: [AnimalActivities.animalId],
    references: [Animals.id],
  }),
  createdByUser: one(Users, {
    fields: [AnimalActivities.createdByUserId],
    references: [Users.id],
  }),
  walk: one(Walks, {
    fields: [AnimalActivities.walkId],
    references: [Walks.id],
  }),
}));

export const AnimalMediaRelations = relations(AnimalMedia, ({ one }) => ({
  animal: one(Animals, {
    fields: [AnimalMedia.animalId],
    references: [Animals.id],
  }),
  createdByUser: one(Users, {
    fields: [AnimalMedia.createdByUserId],
    references: [Users.id],
  }),
}));

// Add AnimalTags relations
export const AnimalTagsRelations = relations(AnimalTags, ({ one }) => ({
  animal: one(Animals, {
    fields: [AnimalTags.animalId],
    references: [Animals.id],
  }),
  createdByUser: one(Users, {
    fields: [AnimalTags.createdByUserId],
    references: [Users.id],
  }),
  shelter: one(Shelters, {
    fields: [AnimalTags.shelterId],
    references: [Shelters.id],
  }),
  walk: one(Walks, {
    fields: [AnimalTags.walkId],
    references: [Walks.id],
  }),
}));

// Add ShortUrl relations
export const ShortUrlRelations = relations(ShortUrl, () => ({}));
