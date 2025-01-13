"use client";

import type { AnimalTypeWithRelations, KennelType } from "@acme/db/schema";
import { Dialog, DialogContent, DialogHeader } from "@acme/ui/dialog";
import { cn } from "@acme/ui/lib/utils";

import { KennelCellDialogContent } from "./content";
import { KennelCellDialogHeader } from "./header";

interface KennelCellDialogProps {
  animal?: AnimalTypeWithRelations;
  kennel: KennelType;
  kennels: KennelType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KennelCellDialogDialog({
  animal,
  kennel,
  kennels,
  open,
  onOpenChange,
}: KennelCellDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("flex max-h-[90vh] flex-col", {
          "border-t-4 border-t-purple": animal?.difficultyLevel === "Purple",
          "border-t-4 border-t-red": animal?.difficultyLevel === "Red",
          "border-t-4 border-t-yellow": animal?.difficultyLevel === "Yellow",
        })}
      >
        <DialogHeader className="flex-none">
          <KennelCellDialogHeader
            animal={animal}
            kennel={kennel}
            variant="dialog"
          />
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <KennelCellDialogContent
            animal={animal}
            kennelId={kennel.id}
            kennels={kennels}
            onOpenChange={onOpenChange}
            roomId={kennel.room.id}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
