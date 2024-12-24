"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

import { mockAnimals } from "../../_mock-data/animals";

interface PageProps {
  params: Promise<{
    animalId: string;
  }>;
}

function getAnimal(animalId: string) {
  return mockAnimals.find((animal) => animal.id === animalId) ?? null;
}

export default function WalkPage({ params }: PageProps) {
  const router = useRouter();
  const { animalId } = use(params);
  const animal = getAnimal(animalId);

  useEffect(() => {
    if (animal) {
      router.push(`/animals/${animalId}/walk/in-progress`);
    } else {
      router.push("/animals");
    }
  }, [animal, animalId, router]);

  return null;
}
