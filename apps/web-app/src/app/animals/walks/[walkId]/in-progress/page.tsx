import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { Walks } from "@acme/db/schema";

import { WalkHeader } from "../_components/walk-header";
import { WalkTimer } from "../_components/walk-timer";

interface PageProps {
  params: Promise<{
    walkId: string;
  }>;
}

export default async function WalkInProgressPage({ params }: PageProps) {
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
              kennel: true,
            },
          },
          media: true,
          notes: true,
          tags: true,
        },
      },
      media: true,
      notes: true
    },
  });

  if (!walk) {
    notFound();
  }

  return (
    <>
      <WalkHeader walk={walk} />

      <div className="container flex min-h-[calc(100vh-96px)] max-w-3xl items-center justify-center pb-24">
        <WalkTimer walk={walk} />
      </div>
    </>
  );
}
