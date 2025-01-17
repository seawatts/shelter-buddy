"use client";

import { useCallback, useEffect, useState } from "react";
import { useServerAction } from "zsa-react";

import type { WalkTypeWithRelations } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";

import { AnimalImages } from "~/components/animal-images";
import { endWalkAction } from "./actions";

interface WalkTimerProps {
  walk: WalkTypeWithRelations;
}

function ElapsedTimeDisplay({ startedAt }: { startedAt: Date | string }) {
  const getElapsedTime = useCallback(() => {
    const now = new Date();
    const startTime = new Date(startedAt);
    const diffInSeconds = Math.floor(
      (now.getTime() - startTime.getTime()) / 1000,
    );
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [startedAt]);

  const [elapsedTime, setElapsedTime] = useState("0:00");

  useEffect(() => {
    setElapsedTime(getElapsedTime());

    const timer = setInterval(() => {
      setElapsedTime(getElapsedTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [getElapsedTime]);

  return (
    <div className="text-center">
      <div className="text-6xl font-bold">{elapsedTime}</div>
      <p className="mt-2 text-muted-foreground">Time Elapsed</p>
    </div>
  );
}

export function WalkTimer({ walk }: WalkTimerProps) {
  const endWalkServerAction = useServerAction(endWalkAction);

  const handleEndWalk = async () => {
    try {
      await endWalkServerAction.execute({
        walkId: walk.id,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to end walk:", error.message);
      } else {
        console.error("Failed to end walk:", error);
      }
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8 pt-12">
      <ElapsedTimeDisplay startedAt={walk.startedAt} />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Return to kennel</span>
        <div className="rounded-full bg-secondary px-3 py-1 text-center font-medium">
          {walk.animal.kennelOccupants[0]?.kennel.name}
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <AnimalImages
          animalId={walk.animal.id}
          shelterId={walk.animal.shelterId}
          name={walk.animal.name}
          roomId={walk.animal.kennelOccupants[0]?.kennel.roomId ?? ""}
          kennelId={walk.animal.kennelOccupants[0]?.kennelId ?? ""}
          media={walk.media}
          walkId={walk.id}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 bg-background p-4 shadow-lg">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
          <Button
            variant="destructive"
            size="lg"
            className="w-full"
            onClick={handleEndWalk}
            disabled={endWalkServerAction.isPending}
          >
            {endWalkServerAction.isPending ? (
              <>
                <Icons.Spinner size="sm" variant="primary" className="mr-2" />
                Ending Walk...
              </>
            ) : (
              "End Walk"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
