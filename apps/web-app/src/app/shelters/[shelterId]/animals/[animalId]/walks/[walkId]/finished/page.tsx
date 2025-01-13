import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { Walks } from "@acme/db/schema";

import { WalkSession } from "../_components/walk-session";

interface PageProps {
  params: Promise<{
    walkId: string;
  }>;
}

export default async function WalkFinishedPage({ params }: PageProps) {
  const { walkId } = await params;
  const walk = await db.query.Walks.findFirst({
    where: eq(Walks.id, walkId),
    with: {
      animal: {
        with: {
          activities: true,
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
          media: true,
          notes: true,
          tags: true,
        },
      },
      media: true,
      notes: true,
    },
  });

  if (!walk) {
    return notFound();
  }

  return <WalkSession walk={walk} />;
}
