import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { Animals } from "@acme/db/schema";

interface PageProps {
  params: Promise<{
    animalId: string;
  }>;
}

export default async function WalkPage({ params }: PageProps) {
  const { animalId } = await params;
  const animal = await db.query.Animals.findFirst({
    where: eq(Animals.id, animalId),
  });

  if (!animal) {
    return redirect("/animals");
  }

  redirect(`/animals/${animalId}/walk/in-progress`);

  return null;
}
