"use client";

import { format } from "date-fns";

import { Badge } from "@acme/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { cn } from "@acme/ui/lib/utils";

import type { Animal, Kennel } from "../../../types";
import { AnimalImages } from "../animal-images";
import { getLastCompletedWalk } from "../utils";
import { WalkStatus } from "../walk-status";
import { KennelActionsContent } from "./kennel-actions-content";

interface KennelActionsDialogProps {
  animal: Animal | undefined;
  kennel: Kennel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KennelActionsDialog({
  animal,
  kennel,
  open,
  onOpenChange,
}: KennelActionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn({
          "border-t-purple border-t-4": animal?.difficultyLevel === "Purple",
          "border-t-red border-t-4": animal?.difficultyLevel === "Red",
          "border-t-yellow border-t-4": animal?.difficultyLevel === "Yellow",
        })}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <DialogTitle>
                  {kennel.id} {animal && `- ${animal.name}`}
                </DialogTitle>
                {animal?.tags && animal.tags.length > 0 && (
                  <div className="flex gap-1">
                    {animal.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className={cn("rounded-full text-xs", {
                          "bg-gray-400 dark:bg-gray-500": tag === "last",
                          "bg-gray-500 dark:bg-gray-400": tag === "first",
                        })}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {animal && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const lastWalk = getLastCompletedWalk(animal);
                      if (!lastWalk) return "No walks completed";
                      return `Last walk: ${format(
                        lastWalk.date,
                        "h:mm a",
                      )} (${lastWalk.duration} min)`;
                    })()}
                  </p>
                  <WalkStatus animal={animal} />
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <AnimalImages name={animal?.name} media={animal?.media} />
          <KennelActionsContent animal={animal} onOpenChange={onOpenChange} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
