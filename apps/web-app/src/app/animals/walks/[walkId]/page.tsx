import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { Walks } from "@acme/db/schema";

import { WalkSessionReadOnly } from "./_components/walk-session-readonly";

interface PageProps {
  params: {
    walkId: string;
  };
}

export default async function WalkPage({ params }: PageProps) {
  const { walkId } = params;
  const walk = await db.query.Walks.findFirst({
    where: eq(Walks.id, walkId),
    with: {
      activities: true,
      animal: {
        with: {
          activities: true,
          kennelOccupants: {
            limit: 1,
            orderBy: (kennel, { desc }) => desc(kennel.startedAt),
            where: (kennel, { isNull }) => isNull(kennel.endedAt),
            with: {
              kennel: true,
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

  return <WalkSessionReadOnly walk={walk} />;
}
