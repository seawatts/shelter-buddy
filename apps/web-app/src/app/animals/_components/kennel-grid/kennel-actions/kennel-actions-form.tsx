"use client";

import { useTransition } from "react";

import type { AnimalType } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { toast } from "@acme/ui/toast";

import {
  addAnimalNoteAction,
  reassignKennelAction,
  toggleOutOfKennelAction,
} from "./actions";

interface KennelActionsFormProps {
  animal: AnimalType;
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
  const [isPending, startTransition] = useTransition();

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
    startTransition(() => {
      (
        toggleOutOfKennelAction as unknown as (input: {
          animalId: string;
          isOutOfKennel: boolean;
        }) => Promise<ActionResult>
      )({
        animalId: animal.id,
        isOutOfKennel: !animal.isOutOfKennel,
      })
        .then((result) => {
          if (result.success) {
            toast.success(
              `${animal.name} marked ${
                animal.isOutOfKennel ? "in" : "out of"
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

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleAddNote}
        disabled={isPending}
      >
        {isPending ? (
          <Icons.Spinner className="mr-2" />
        ) : (
          <Icons.Plus className="mr-2" />
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
          <Icons.Spinner className="mr-2" />
        ) : (
          <Icons.ArrowRight className="mr-2" />
        )}
        Reassign Kennel
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleToggleOutOfKennel}
        disabled={isPending}
      >
        {(() => {
          if (isPending) {
            return <Icons.Spinner className="mr-2" />;
          }
          return animal.isOutOfKennel ? (
            <Icons.ArrowLeft className="mr-2" />
          ) : (
            <Icons.ArrowRight className="mr-2" />
          );
        })()}
        {animal.isOutOfKennel ? "Mark In Kennel" : "Mark Out of Kennel"}
      </Button>
    </div>
  );
}
