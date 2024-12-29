"use client";

import { useMemo } from "react";
import { format } from "date-fns";

import type { AnimalTypeWithRelations, KennelType } from "@acme/db/schema";
import { Badge } from "@acme/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { cn } from "@acme/ui/lib/utils";

import { getLastCompletedWalk } from "../utils";
import { WalkStatus } from "../walk-status";
import { KennelActionsContent } from "./kennel-actions-content";

interface KennelActionsDialogProps {
  animal?: AnimalTypeWithRelations;
  kennel: KennelType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KennelActionsDialog({
  animal,
  kennel,
  open,
  onOpenChange,
}: KennelActionsDialogProps) {
  const lastWalk = useMemo(
    () => (animal ? getLastCompletedWalk(animal) : null),
    [animal],
  );
  const lastWalkText = useMemo(() => {
    if (!lastWalk) return "No walks completed";
    return `Last walk: ${format(lastWalk.date, "h:mm a")} (${lastWalk.duration} min)`;
  }, [lastWalk]);

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
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <DialogTitle>
                  {kennel.name} {animal && `- ${animal.name}`}
                </DialogTitle>
                {animal?.tags && animal.tags.length > 0 && (
                  <div className="flex gap-1">
                    {animal.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        className={cn("rounded-full text-xs", {
                          "bg-gray-400 dark:bg-gray-500": tag.tag === "last",
                          "bg-gray-500 dark:bg-gray-400": tag.tag === "first",
                        })}
                      >
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {animal && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {lastWalkText}
                  </p>
                  <WalkStatus animal={animal} />
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <KennelActionsContent
              animal={animal}
              kennelId={kennel.id}
              onOpenChange={onOpenChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
