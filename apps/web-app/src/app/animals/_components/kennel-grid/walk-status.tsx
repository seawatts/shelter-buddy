"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServerAction } from "zsa-react";

import type { AnimalType } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { toast } from "@acme/ui/toast";

import { startWalkAction, stopWalkAction } from "../actions";
import { hasWalkInProgress } from "./utils";

export function WalkStatus({ animal }: { animal: AnimalType }) {
  const router = useRouter();
  const startWalkServerAction = useServerAction(startWalkAction);
  const stopWalkServerAction = useServerAction(stopWalkAction);
  const walkInProgress = useMemo(() => hasWalkInProgress(animal), [animal]);

  const handleStartWalk = useCallback(async () => {
    try {
      const [result, error] = await startWalkServerAction.execute({
        animalId: animal.id,
      });

      if (result) {
        router.push(`/animals/${animal.id}/walk/in-progress`);
      } else if (error) {
        console.error("Error starting walk", error);
        toast.error(error.message);
      }
    } catch {
      toast.error("Failed to start walk");
    }
  }, [animal.id, startWalkServerAction, router]);

  const handleStopWalk = useCallback(async () => {
    if (!walkInProgress) return;

    try {
      const [_, error] = await stopWalkServerAction.execute({
        animalId: animal.id,
        walkId: walkInProgress.id,
      });

      if (error) {
        console.error("Error stopping walk", error);
        toast.error(error.message);
      } else {
        router.push(`/animals/${animal.id}/walk/finished`);
      }
    } catch {
      toast.error("Failed to stop walk");
    }
  }, [animal.id, stopWalkServerAction, router, walkInProgress]);

  if (!walkInProgress) {
    if (animal.isOutOfKennel) {
      return (
        <Button
          className="gap-2"
          onClick={() => {
            // TODO: Implement mark in kennel functionality
            console.log("Mark in kennel clicked");
          }}
        >
          <Icons.ArrowLeft className="size-3" />
          Mark In Kennel
        </Button>
      );
    }
    return (
      <Button
        variant="default"
        className="gap-2"
        onClick={handleStartWalk}
        disabled={startWalkServerAction.isPending}
      >
        {startWalkServerAction.isPending ? (
          <Icons.Spinner className="size-3" />
        ) : (
          <Icons.Play className="size-3" />
        )}
        Start Walk
      </Button>
    );
  }

  return (
    <Button
      variant="destructive"
      className="gap-2"
      onClick={handleStopWalk}
      disabled={stopWalkServerAction.isPending}
    >
      {stopWalkServerAction.isPending ? (
        <Icons.Spinner className="size-3" />
      ) : (
        <Icons.X className="size-3" />
      )}
      Stop Walk
    </Button>
  );
}
