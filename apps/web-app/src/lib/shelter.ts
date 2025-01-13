"use server";

import { eq } from "drizzle-orm";

import type { ThemeConfig } from "@acme/db/schema";
import { db } from "@acme/db/client";
import { Shelters } from "@acme/db/schema";

export async function getCurrentShelter() {
  const shelter = await db.query.Shelters.findFirst({
    with: {
      kennelRooms: true,
    },
  });

  return shelter;
}

export async function updateShelterTheme(
  shelterId: string,
  themeConfig: ThemeConfig,
) {
  await db
    .update(Shelters)
    .set({ themeConfig })
    .where(eq(Shelters.id, shelterId));
}

export async function getShelterById(id: string) {
  return db.query.Shelters.findFirst({
    where: eq(Shelters.id, id),
  });
}

export async function getShelterByClerkId(clerkShelterId: string) {
  return db.query.Shelters.findFirst({
    where: eq(Shelters.clerkOrgId, clerkShelterId),
  });
}
