"use client";

import { useCallback, useMemo } from "react";
import { useServerAction } from "zsa-react";

import type { AnimalTypeWithRelations } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { toast } from "@acme/ui/toast";

import { startWalkAction, stopWalkAction } from "../actions";
import { toggleOutOfKennelAction } from "./kennel-actions/actions";
import { hasWalkInProgress } from "./utils";

export function WalkStatus({ animal }: { animal: AnimalTypeWithRelations }) {
  const startWalkServerAction = useServerAction(startWalkAction);
  const stopWalkServerAction = useServerAction(stopWalkAction);
  const toggleOutOfKennelServerAction = useServerAction(
    toggleOutOfKennelAction,
  );
  const walkInProgress = useMemo(() => hasWalkInProgress(animal), [animal]);

  const handleStartWalk = useCallback(async () => {
    try {
      await startWalkServerAction.execute({
        animalId: animal.id,
      });
    } catch (error) {
      toast.error("Failed to start walk");
      console.error("Error starting walk", error);
    }
  }, [animal.id, startWalkServerAction]);

  const handleStopWalk = useCallback(async () => {
    if (!walkInProgress) return;

    try {
      await stopWalkServerAction.execute({
        animalId: animal.id,
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
            <Icons.Spinner size="xs" variant="primary" />
          ) : (
            <Icons.ArrowLeft size="xs" variant="primary" />
          )}
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
          <Icons.Spinner size="xs" variant="primary" />
        ) : (
          <Icons.Play size="xs" variant="primary" />
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
