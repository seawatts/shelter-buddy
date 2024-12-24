"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PhotoCapture } from "../_components/photo-capture";
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
  const [photos, setPhotos] = useState<string[]>([]);

  const startTime = searchParams.get("startTime");
  const elapsedTime = searchParams.get("elapsedTime");

  useEffect(() => {
    if (!animal) {
      router.push("/animals");
    }
  }, [animal, router]);

  if (!animal) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <WalkSession
        animal={animal}
        initialData={{
          completed: false,
          elapsedTime: elapsedTime ?? undefined,
          time: startTime ?? new Date().toISOString(),
        }}
      />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Walk Photos</h2>
        <PhotoCapture photos={photos} onPhotosTaken={setPhotos} />
      </div>
    </div>
  );
}
