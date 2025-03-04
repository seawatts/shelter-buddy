"use client";

import { useCallback, useMemo } from "react";
import { useServerAction } from "zsa-react";

import type { AnimalTypeWithRelations } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { toast } from "@acme/ui/toast";

import { hasWalkInProgress } from "../utils";
import {
  startWalkAction,
  stopWalkAction,
  toggleOutOfKennelAction,
} from "./actions";

export function KennelCellDialogHeaderButtons({
  animal,
}: {
  animal: AnimalTypeWithRelations;
}) {
  const startWalkServerAction = useServerAction(startWalkAction, {
    onError: (error) => {
      toast.error("Failed to start walk");
      console.error("Error starting walk", error);
    },
  });
  const stopWalkServerAction = useServerAction(stopWalkAction);
  const toggleOutOfKennelServerAction = useServerAction(
    toggleOutOfKennelAction,
  );
  const walkInProgress = useMemo(() => hasWalkInProgress(animal), [animal]);

  const handleStopWalk = useCallback(async () => {
    if (!walkInProgress) return;

    try {
      await stopWalkServerAction.execute({
        animalId: animal.id,
        shelterId: animal.shelterId,
        walkId: walkInProgress.id,
      });
    } catch (error) {
      toast.error("Failed to stop walk");
      console.error("Error stopping walk", error);
    }
  }, [animal.id, stopWalkServerAction, walkInProgress]);

  const handleToggleOutOfKennel = useCallback(async () => {
    const currentKennelOccupant = animal.kennelOccupants.find(
      (k) => !k.endedAt,
    );
    if (!currentKennelOccupant) return;

    try {
      const [result] = await toggleOutOfKennelServerAction.execute({
        animalId: animal.id,
        isOutOfKennel: !currentKennelOccupant.isOutOfKennel,
        shelterId: animal.shelterId,
      });

      if (result?.success) {
        toast.success(
          `${animal.name} marked ${
            currentKennelOccupant.isOutOfKennel ? "in" : "out of"
          } kennel`,
        );
      }
    } catch (error) {
      console.error("Error toggling out of kennel status:", error);
      toast.error("Failed to update kennel status");
    }
  }, [
    animal.id,
    animal.kennelOccupants,
    animal.name,
    toggleOutOfKennelServerAction,
  ]);

  if (!walkInProgress) {
    if (animal.kennelOccupants.some((k) => k.isOutOfKennel)) {
      return (
        <Button
          className="gap-2"
          onClick={handleToggleOutOfKennel}
          disabled={toggleOutOfKennelServerAction.isPending}
        >
          {toggleOutOfKennelServerAction.isPending ? (
            <Icons.Spinner size="xs" />
          ) : (
            <Icons.ArrowLeft size="xs" />
          )}
          Mark In Kennel
        </Button>
      );
    }
    return (
      <Button
        variant="default"
        className="gap-2"
        onClick={() =>
          startWalkServerAction.execute({
            animalId: animal.id,
            shelterId: animal.shelterId,
          })
        }
        disabled={startWalkServerAction.isPending}
      >
        {startWalkServerAction.isPending ? (
          <Icons.Spinner size="xs" />
        ) : (
          <Icons.Footprints size="xs" />
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
        <Icons.Spinner size="xs" variant="primary" />
      ) : (
        <Icons.X size="xs" variant="primary" />
      )}
      Stop Walk
    </Button>
  );
}
