"use client";

import { useState } from "react";
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

import {
  markAdoptedAction,
  markInFosterAction,
  reassignKennelAction,
  startWalkAction,
  toggleOutOfKennelAction,
} from "./actions";
import { KennelActionConfirmationDialog } from "./confirmation-dialog";

interface KennelActionsFormProps {
  animal: AnimalTypeWithRelations;
  onOpenChange: (open: boolean) => void;
  kennels: KennelType[];
}

type ConfirmationAction = {
  description: string;
  isLoading: boolean;
  onConfirm: () => Promise<void>;
  title: string;
} | null;

export function KennelCellDialogQuickButtons({
  animal,
  onOpenChange,
  kennels,
}: KennelActionsFormProps) {
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction>(null);

  const startWalkServerAction = useServerAction(startWalkAction, {
    onError: (error) => {
      console.error("Error starting walk", error);
      toast.error("Failed to start walk");
    },
  });
  const reassignKennelServerAction = useServerAction(reassignKennelAction);
  const toggleOutOfKennelServerAction = useServerAction(
    toggleOutOfKennelAction,
  );
  const markAdoptedServerAction = useServerAction(markAdoptedAction);
  const markInFosterServerAction = useServerAction(markInFosterAction);

  const handleReassignKennel = (newKennelId: string) => {
    const targetKennel = kennels.find((k) => k.id === newKennelId);
    if (!targetKennel) return;

    setConfirmationAction({
      description: `Are you sure you want to move ${animal.name} to ${targetKennel.name}?`,
      isLoading: reassignKennelServerAction.isPending,
      onConfirm: async () => {
        try {
          await reassignKennelServerAction.execute({
            animalId: animal.id,
            newKennelId,
            shelterId: animal.shelterId,
          });

          toast.success("Kennel reassigned successfully");
          onOpenChange(false);
          setConfirmationAction(null);
        } catch (error) {
          console.error("Error reassigning kennel:", error);
          toast.error("Failed to reassign kennel");
        }
      },
      title: `Reassign ${animal.name} to kennel ${targetKennel.name}`,
    });
  };

  const handleToggleOutOfKennel = () => {
    const currentKennelOccupant = animal.kennelOccupants.find(
      (k) => !k.endedAt,
    );
    if (!currentKennelOccupant) return;

    setConfirmationAction({
      description: `Are you sure you want to mark ${animal.name} as ${
        currentKennelOccupant.isOutOfKennel ? "in" : "out of"
      } kennel?`,
      isLoading: toggleOutOfKennelServerAction.isPending,
      onConfirm: async () => {
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
            onOpenChange(false);
            setConfirmationAction(null);
          }
        } catch (error) {
          console.error("Error toggling out of kennel status:", error);
          toast.error("Failed to update kennel status");
        }
      },
      title: currentKennelOccupant.isOutOfKennel
        ? `Mark ${animal.name} in kennel`
        : `Mark ${animal.name} out of kennel`,
    });
  };

  const handleMarkAdopted = () => {
    setConfirmationAction({
      description: `Are you sure you want to mark ${animal.name} as adopted?`,
      isLoading: markAdoptedServerAction.isPending,
      onConfirm: async () => {
        try {
          const [result] = await markAdoptedServerAction.execute({
            animalId: animal.id,
            shelterId: animal.shelterId,
          });

          if (result?.success) {
            toast.success(`${animal.name} marked as adopted`);
            onOpenChange(false);
            setConfirmationAction(null);
          }
        } catch (error) {
          console.error("Error marking as adopted:", error);
          toast.error("Failed to mark as adopted");
        }
      },
      title: `Mark ${animal.name} as Adopted`,
    });
  };

  const handleMarkInFoster = () => {
    setConfirmationAction({
      description: `Are you sure you want to mark ${animal.name} as in foster?`,
      isLoading: markInFosterServerAction.isPending,
      onConfirm: async () => {
        try {
          const [result] = await markInFosterServerAction.execute({
            animalId: animal.id,
            shelterId: animal.shelterId,
          });

          if (result?.success) {
            toast.success(`${animal.name} marked as in foster`);
            onOpenChange(false);
            setConfirmationAction(null);
          }
        } catch (error) {
          console.error("Error marking as in foster:", error);
          toast.error("Failed to mark as in foster");
        }
      },
      title: `Mark ${animal.name} as In Foster`,
    });
  };

  const currentKennelOccupant = animal.kennelOccupants.find((k) => !k.endedAt);
  const currentKennelId = currentKennelOccupant?.kennelId;

  // Filter out the current kennel and get available kennels
  const availableKennels = kennels.filter((k) => k.id !== currentKennelId);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() =>
            startWalkServerAction.execute({
              animalId: animal.id,
              isNewWalk: false,
              shelterId: animal.shelterId,
            })
          }
          disabled={startWalkServerAction.isPending}
        >
          {startWalkServerAction.isPending ? (
            <Icons.Spinner className="mr-2" size="sm" variant="primary" />
          ) : (
            <Icons.Footprints className="mr-2" size="sm" variant="primary" />
          )}
          Add Existing Walk
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
                <Icons.Shuffle className="mr-2" size="sm" variant="primary" />
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
              <Icons.Download className="mr-2" size="sm" variant="primary" />
            ) : (
              <Icons.Upload className="mr-2" size="sm" variant="primary" />
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

      {confirmationAction && (
        <KennelActionConfirmationDialog
          description={confirmationAction.description}
          isLoading={confirmationAction.isLoading}
          onConfirm={confirmationAction.onConfirm}
          onOpenChange={(open) => {
            if (!open) {
              setConfirmationAction(null);
            }
          }}
          open={!!confirmationAction}
          title={confirmationAction.title}
        />
      )}
    </>
  );
}
