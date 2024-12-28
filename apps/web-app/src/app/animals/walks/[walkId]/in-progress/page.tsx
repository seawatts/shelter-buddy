import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { Walks } from "@acme/db/schema";

import { WalkHeader } from "../_components/walk-header";
import { WalkTimer } from "../_components/walk-timer";
import { DIFFICULTY_CONFIG } from "../../../_utils/difficulty-config";

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
      animal: true,
      media: true,
    },
  });

  if (!walk) {
    notFound();
  }

  const difficultyConfig = DIFFICULTY_CONFIG[walk.animal.difficultyLevel];

  return (
    <>
      <WalkHeader
        walkId={walkId}
        animalName={walk.animal.name}
        difficultyConfig={difficultyConfig}
      />

      <div className="container flex min-h-[calc(100vh-96px)] max-w-3xl items-center justify-center pb-24">
        <WalkTimer walkId={walkId} />
      </div>
    </>
  );
}
