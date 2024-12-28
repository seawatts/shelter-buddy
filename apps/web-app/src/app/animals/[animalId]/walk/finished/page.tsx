import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { Animals, Walks } from "@acme/db/schema";

import { WalkSession } from "../_components/walk-session";

interface PageProps {
  params: Promise<{
    animalId: string;
    walkId: string;
  }>;
}

export default async function WalkFinishedPage({ params }: PageProps) {
  const { animalId, walkId } = await params;
  const animal = await db.query.Animals.findFirst({
    where: eq(Animals.id, animalId),
    with: {
      activities: true,
      kennelOccupants: {
        limit: 1,
        orderBy: (kennel, { desc }) => desc(kennel.startedAt),
        where: (kennel, { isNotNull }) => isNotNull(kennel.endedAt),
        with: {
          kennel: true,
        },
      },
      media: true,
      notes: true,
      tags: true,
      walks: {
        with: {
          media: true,
        },
      },
    },
  });
  const walk = await db.query.Walks.findFirst({
    where: eq(Walks.id, walkId),
    with: {
      media: true,
    },
  });

  if (!animal || !walk) {
    return null;
  }

  return <WalkSession animal={animal} walk={walk} />;
}
