import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createServerActionProcedure } from "zsa";

import { db } from "@acme/db/client";
import { ShelterMembers } from "@acme/db/schema";

export const authenticatedAction = createServerActionProcedure()
  .input(
    z.object({
      shelterId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const user = await currentUser();

    if (!user) {
      redirect("/sign-in");
    }

    const dbUser = await db.query.ShelterMembers.findFirst({
      where: and(
        eq(ShelterMembers.userId, user.id),
        eq(ShelterMembers.shelterId, input.shelterId),
      ),
    });

    if (!dbUser) {
      redirect("/sign-in");
    }

    return { db, user };
  });

export const unauthenticatedAction = createServerActionProcedure().handler(
  () => {
    return { user: null };
  },
);
