import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { Animals } from "@acme/db/schema";

import { AnimalDetails } from "./_components/animal-details";

interface PageProps {
  params: Promise<{
    animalId: string;
  }>;
}

export default async function AnimalPage({ params }: PageProps) {
  const { animalId } = await params;
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

  if (!animal) {
    return (
      <div className="container py-8">
        <h1 className="text-red-500 text-3xl font-bold">Animal Not Found</h1>
        <p className="mt-4">
          The animal with ID {animalId} could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <AnimalDetails animal={animal} />
    </div>
  );
}
