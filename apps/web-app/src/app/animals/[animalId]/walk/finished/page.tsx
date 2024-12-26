"use client";

import { use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { WalkSession } from "../_components/walk-session";
import { mockAnimals } from "../../../_mock-data/animals";

interface PageProps {
  params: Promise<{
    animalId: string;
  }>;
}

function getAnimal(animalId: string) {
  return mockAnimals.find((animal) => animal.id === animalId) ?? null;
}

export default function WalkFinishedPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { animalId } = use(params);
  const animal = getAnimal(animalId);

  const startTime = searchParams.get("startTime");

  useEffect(() => {
    if (!animal) {
      router.push("/animals");
    }
  }, [animal, router]);

  if (!animal) {
    return null;
  }

  return (
    <WalkSession
      animal={animal}
      initialData={{
        endedAt: new Date(),
        startedAt: startTime ? new Date(startTime) : new Date(),
        status: "completed",
      }}
    />
  );
}
