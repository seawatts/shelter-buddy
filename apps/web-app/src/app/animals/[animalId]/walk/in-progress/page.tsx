import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { Animals } from "@acme/db/schema";

import { WalkHeader } from "../_components/walk-header";
import { WalkTimer } from "../_components/walk-timer";
import { DIFFICULTY_CONFIG } from "../../../_utils/difficulty-config";

interface PageProps {
  params: Promise<{
    animalId: string;
  }>;
}

export default async function WalkInProgressPage({ params }: PageProps) {
  const { animalId } = await params;
  const animal = await db.query.Animals.findFirst({
    where: eq(Animals.id, animalId),
  });

  if (!animal) {
    notFound();
  }

  const difficultyConfig = DIFFICULTY_CONFIG[animal.difficultyLevel];

  return (
    <>
      <WalkHeader
        animalId={animalId}
        animalName={animal.name}
        difficultyConfig={difficultyConfig}
      />

      <div className="container flex min-h-[calc(100vh-96px)] max-w-3xl items-center justify-center pb-24">
        <WalkTimer animalId={animalId} />
      </div>
    </>
  );
}
