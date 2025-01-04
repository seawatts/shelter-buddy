"use client";

import { useServerAction } from "zsa-react";

import type { AnimalTypeWithRelations, KennelType } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { toast } from "@acme/ui/toast";

import { startWalkAction } from "../../actions";
import {
  addAnimalNoteAction,
  markAdoptedAction,
  markInFosterAction,
  reassignKennelAction,
  toggleOutOfKennelAction,
} from "./actions";

interface KennelActionsFormProps {
  animal: AnimalTypeWithRelations;
  onOpenChange: (open: boolean) => void;
  kennels: KennelType[];
}

export function KennelActionsForm({
  animal,
  onOpenChange,
  kennels,
}: KennelActionsFormProps) {
  const startWalkServerAction = useServerAction(startWalkAction);
  const addNoteServerAction = useServerAction(addAnimalNoteAction);
  const reassignKennelServerAction = useServerAction(reassignKennelAction);
  const toggleOutOfKennelServerAction = useServerAction(
    toggleOutOfKennelAction,
  );
  const markAdoptedServerAction = useServerAction(markAdoptedAction);
  const markInFosterServerAction = useServerAction(markInFosterAction);

  const handleStartWalk = async () => {
    try {
      await startWalkServerAction.execute({
        animalId: animal.id,
        isNewWalk: false,
      });
    } catch (error) {
      toast.error("Failed to start walk");
      console.error("Failed to start walk", error);
    }
  };

  const handleAddNote = async () => {
    try {
      const [result] = await addNoteServerAction.execute({
        animalId: animal.id,
        notes: "Added a note",
        type: "general",
      });

      if (result?.success) {
        toast.success("Note added successfully");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    }
  };

  const handleReassignKennel = async (newKennelId: string) => {
    try {
      await reassignKennelServerAction.execute({
        animalId: animal.id,
        newKennelId,
      });

      toast.success("Kennel reassigned successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error reassigning kennel:", error);
      toast.error("Failed to reassign kennel");
    }
  };

  const handleToggleOutOfKennel = async () => {
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
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error toggling out of kennel status:", error);
      toast.error("Failed to update kennel status");
    }
  };

  const handleMarkAdopted = async () => {
    try {
      const [result] = await markAdoptedServerAction.execute({
        animalId: animal.id,
      });

      if (result?.success) {
        toast.success(`${animal.name} marked as adopted`);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error marking as adopted:", error);
      toast.error("Failed to mark as adopted");
    }
  };

  const handleMarkInFoster = async () => {
    try {
      const [result] = await markInFosterServerAction.execute({
        animalId: animal.id,
      });

      if (result?.success) {
        toast.success(`${animal.name} marked as in foster`);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error marking as in foster:", error);
      toast.error("Failed to mark as in foster");
    }
  };

  const currentKennelOccupant = animal.kennelOccupants.find((k) => !k.endedAt);
  const currentKennelId = currentKennelOccupant?.kennelId;

  // Filter out the current kennel and get available kennels
  const availableKennels = kennels.filter((k) => k.id !== currentKennelId);

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleStartWalk}
        disabled={startWalkServerAction.isPending}
      >
        {startWalkServerAction.isPending ? (
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
        disabled={addNoteServerAction.isPending}
      >
        {addNoteServerAction.isPending ? (
          <Icons.Spinner className="mr-2" size="sm" variant="primary" />
        ) : (
          <Icons.Plus className="mr-2" size="sm" variant="primary" />
        )}
        Add Note
      </Button>
      <Select
        onValueChange={handleReassignKennel}
        disabled={reassignKennelServerAction.isPending}
      >
        <SelectTrigger className="w-full">
          <div className="ml-1 flex items-center gap-2">
            {reassignKennelServerAction.isPending ? (
              <Icons.Spinner className="mr-2" size="sm" variant="primary" />
            ) : (
              <Icons.ArrowRight className="mr-2" size="sm" variant="primary" />
            )}
            <SelectValue placeholder="Reassign Kennel" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableKennels.map((kennel) => (
            <SelectItem key={kennel.id} value={kennel.id}>
              {kennel.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleToggleOutOfKennel}
        disabled={
          toggleOutOfKennelServerAction.isPending || !currentKennelOccupant
        }
      >
        {(() => {
          if (toggleOutOfKennelServerAction.isPending) {
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
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleMarkAdopted}
        disabled={markAdoptedServerAction.isPending}
      >
        {markAdoptedServerAction.isPending ? (
          <Icons.Spinner className="mr-2" size="sm" variant="primary" />
        ) : (
          <Icons.Heart className="mr-2" size="sm" variant="primary" />
        )}
        Mark Adopted
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleMarkInFoster}
        disabled={markInFosterServerAction.isPending}
      >
        {markInFosterServerAction.isPending ? (
          <Icons.Spinner className="mr-2" size="sm" variant="primary" />
        ) : (
          <Icons.Home className="mr-2" size="sm" variant="primary" />
        )}
        Mark In Foster
      </Button>
    </div>
  );
}
