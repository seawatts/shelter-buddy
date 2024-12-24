import { relations } from "drizzle-orm";
import {
  boolean,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
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
  shelterMembers: many(ShelterMembers, {
    relationName: "user",
  }),
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
  createdByUser: one(Users, {
    fields: [Shelters.createdByUserId],
    references: [Users.id],
  }),
  shelterMembers: many(ShelterMembers),
}));

export const updateShelterSchema = createInsertSchema(Shelters, {}).omit({
  createdAt: true,
  createdByUserId: true,
  id: true,
  updatedAt: true,
});

// Shelter Members Table
export const ShelterMembers = pgTable(
  "shelterMembers",
  {
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
  },
  (table) => ({
    shelterUserUnique: unique().on(table.shelterId, table.userId),
  }),
);

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
