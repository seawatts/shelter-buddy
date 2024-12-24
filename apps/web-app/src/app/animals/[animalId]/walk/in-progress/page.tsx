"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/lib/utils";

import { BackIcon } from "../_components/icons";
import { PhotoCapture } from "../_components/photo-capture";
import { mockAnimals } from "../../../_mock-data/animals";
import { DIFFICULTY_CONFIG } from "../../../difficulty-config";

interface PageProps {
  params: Promise<{
    animalId: string;
  }>;
}

function getAnimal(animalId: string) {
  return mockAnimals.find((animal) => animal.id === animalId) ?? null;
}

export default function WalkInProgressPage({ params }: PageProps) {
  const router = useRouter();
  const { animalId } = use(params);
  const animal = getAnimal(animalId);

  const [startTime] = useState(() => new Date());
  const [elapsedTime, setElapsedTime] = useState("0:00");
  const [isScrolled, setIsScrolled] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!animal) {
      router.push("/animals");
      return;
    }
  }, [animal, router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diffInSeconds = Math.floor(
        (now.getTime() - startTime.getTime()) / 1000,
      );
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      setElapsedTime(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleEndWalk = () => {
    router.push(
      `/animals/${animalId}/walk/finished?startTime=${startTime.toISOString()}&elapsedTime=${elapsedTime}`,
    );
  };

  if (!animal) return null;

  const difficultyConfig = DIFFICULTY_CONFIG[animal.difficultyLevel];

  return (
    <>
      {/* Sticky Header */}
      <div
        className={cn(
          "sticky top-0 z-10 border-b bg-background transition-all duration-200",
          isScrolled ? "h-14" : "h-24 sm:h-24",
        )}
      >
        <div className="container h-full max-w-3xl">
          <div className="flex h-full items-center gap-4">
            <Link
              href={`/animals/${animalId}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <BackIcon />
            </Link>
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1
                  className={cn(
                    "font-bold transition-all duration-200",
                    isScrolled ? "text-2xl" : "text-3xl",
                  )}
                >
                  {animal.name}
                </h1>
                {!isScrolled && (
                  <p className="text-sm text-muted-foreground">
                    Walk in progress...
                  </p>
                )}
              </div>
              <div
                className={cn(
                  "flex gap-2",
                  isScrolled
                    ? "flex-row items-center"
                    : "flex-col sm:flex-row sm:items-center",
                )}
              >
                <div className="rounded-full bg-secondary px-3 py-1 text-center text-sm font-medium">
                  {animal.kennelNumber}
                </div>
                <div
                  className="rounded-full px-3 py-1 text-center text-sm font-medium"
                  style={{
                    backgroundColor: difficultyConfig.color,
                    color: "white",
                  }}
                >
                  {difficultyConfig.label}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container flex min-h-[calc(100vh-96px)] max-w-3xl items-center justify-center pb-24">
        <div className="flex w-full flex-col items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-6xl font-bold">{elapsedTime}</div>
            <p className="mt-2 text-muted-foreground">Time Elapsed</p>
          </div>

          <PhotoCapture photos={photos} onPhotosTaken={setPhotos} />

          <div className="flex w-full max-w-sm flex-col gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={handleEndWalk}
            >
              End Walk
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
