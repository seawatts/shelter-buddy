"use client";

import type { Route } from "next";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useServerAction } from "zsa-react";

import type { AnimalTypeWithRelations } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { toast } from "@acme/ui/toast";

import { startWalkAction } from "../../actions";
import {
  addAnimalNoteAction,
  reassignKennelAction,
  toggleOutOfKennelAction,
} from "./actions";

interface KennelActionsFormProps {
  animal: AnimalTypeWithRelations;
  onOpenChange: (open: boolean) => void;
}

interface ActionResult {
  success: boolean;
  data?: unknown;
}

export function KennelActionsForm({
  animal,
  onOpenChange,
}: KennelActionsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const startWalkServerAction = useServerAction(startWalkAction);

  const handleStartWalk = async () => {
    try {
      const [result, error] = await startWalkServerAction.execute({
        animalId: animal.id,
      });

      if (result) {
        router.push(`/animals/walks/${result.id}/finished` as Route);
        onOpenChange(false);
      } else if (error) {
        console.error("Error starting walk", error);
        toast.error(error.message);
      }
    } catch {
      toast.error("Failed to start walk");
    }
  };

  const handleAddNote = () => {
    startTransition(() => {
      (
        addAnimalNoteAction as unknown as (input: {
          animalId: string;
          notes: string;
          type:
            | "medical"
            | "behavioral"
            | "general"
            | "inKennel"
            | "outKennel"
            | "approvedActivities";
        }) => Promise<ActionResult>
      )({
        animalId: animal.id,
        notes: "Added a note",
        type: "general",
      })
        .then((result) => {
          if (result.success) {
            toast.success("Note added successfully");
            onOpenChange(false);
          }
        })
        .catch((error: Error) => {
          console.error("Error adding note:", error);
          toast.error("Failed to add note");
        });
    });
  };

  const handleReassignKennel = (newKennelId: string) => {
    startTransition(() => {
      (
        reassignKennelAction as unknown as (input: {
          animalId: string;
          newKennelId: string;
        }) => Promise<ActionResult>
      )({
        animalId: animal.id,
        newKennelId,
      })
        .then((result) => {
          if (result.success) {
            toast.success("Kennel reassigned successfully");
            onOpenChange(false);
          }
        })
        .catch((error: Error) => {
          console.error("Error reassigning kennel:", error);
          toast.error("Failed to reassign kennel");
        });
    });
  };

  const handleToggleOutOfKennel = () => {
    const currentKennelOccupant = animal.kennelOccupants.find(
      (k) => !k.endedAt,
    );
    if (!currentKennelOccupant) return;

    startTransition(() => {
      (
        toggleOutOfKennelAction as unknown as (input: {
          animalId: string;
          isOutOfKennel: boolean;
        }) => Promise<ActionResult>
      )({
        animalId: animal.id,
        isOutOfKennel: !currentKennelOccupant.isOutOfKennel,
      })
        .then((result) => {
          if (result.success) {
            toast.success(
              `${animal.name} marked ${
                currentKennelOccupant.isOutOfKennel ? "in" : "out of"
              } kennel`,
            );
            onOpenChange(false);
          }
        })
        .catch((error: Error) => {
          console.error("Error toggling out of kennel status:", error);
          toast.error("Failed to update kennel status");
        });
    });
  };

  const currentKennelOccupant = animal.kennelOccupants.find((k) => !k.endedAt);

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleStartWalk}
        disabled={isPending || startWalkServerAction.isPending}
      >
        {isPending || startWalkServerAction.isPending ? (
          <Icons.Spinner className="mr-2" size="sm" variant="primary" />
        ) : (
          <Icons.Play className="mr-2" size="sm" variant="primary" />
        )}
        Add Walk
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleAddNote}
        disabled={isPending}
      >
        {isPending ? (
          <Icons.Spinner className="mr-2" size="sm" variant="primary" />
        ) : (
          <Icons.Plus className="mr-2" size="sm" variant="primary" />
        )}
        Add Note
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => handleReassignKennel("new-kennel-id")}
        disabled={isPending}
      >
        {isPending ? (
          <Icons.Spinner className="mr-2" size="sm" variant="primary" />
        ) : (
          <Icons.ArrowRight className="mr-2" size="sm" variant="primary" />
        )}
        Reassign Kennel
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleToggleOutOfKennel}
        disabled={isPending || !currentKennelOccupant}
      >
        {(() => {
          if (isPending) {
            return (
              <Icons.Spinner className="mr-2" size="sm" variant="primary" />
            );
          }
          return currentKennelOccupant?.isOutOfKennel ? (
            <Icons.ArrowLeft className="mr-2" size="sm" variant="primary" />
          ) : (
            <Icons.ArrowRight className="mr-2" size="sm" variant="primary" />
          );
        })()}
        {currentKennelOccupant?.isOutOfKennel
          ? "Mark In Kennel"
          : "Mark Out of Kennel"}
      </Button>
    </div>
  );
}
