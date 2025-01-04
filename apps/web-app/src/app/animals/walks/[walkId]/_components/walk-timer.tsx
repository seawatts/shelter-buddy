"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useServerAction } from "zsa-react";

import type { WalkTypeWithRelations } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";

import { PhotoUpload } from "~/components/photo-upload/photo-upload";
import { endWalkAction } from "./actions";

interface WalkTimerProps {
  walk: WalkTypeWithRelations;
}

export function WalkTimer({ walk }: WalkTimerProps) {
  const router = useRouter();
  const endWalkServerAction = useServerAction(endWalkAction);
  const [startTime] = useState(() => new Date());
  const [elapsedTime, setElapsedTime] = useState("0:00");
  // const [photos, setPhotos] = useState<string[]>([]);

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

  const handleEndWalk = async () => {
    try {
      const [data, error] = await endWalkServerAction.execute({
        walkId: walk.id,
      });

      if (data?.success) {
        router.push(`/animals/walks/${walk.id}/finished`);
      } else if (error) {
        console.error("Failed to end walk:", error.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to end walk:", error.message);
      } else {
        console.error("Failed to end walk:", error);
      }
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className="text-6xl font-bold">{elapsedTime}</div>
        <p className="mt-2 text-muted-foreground">Time Elapsed</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Return to kennel</span>
        <div className="rounded-full bg-secondary px-3 py-1 text-center font-medium">
          {walk.animal.kennelOccupants[0]?.kennel.name}
        </div>
      </div>

      <PhotoUpload
        animalId={walk.animal.id}
        walkId={walk.id}
        shelterId={walk.animal.shelterId}
      />

      <div className="flex w-full max-w-sm flex-col gap-4">
        <Button
          variant="destructive"
          size="lg"
          className="w-full"
          onClick={handleEndWalk}
          disabled={endWalkServerAction.isPending}
        >
          {endWalkServerAction.isPending ? (
            <>
              <Icons.Spinner className="mr-2" />
              Ending Walk...
            </>
          ) : (
            "End Walk"
          )}
        </Button>
      </div>
    </div>
  );
}
