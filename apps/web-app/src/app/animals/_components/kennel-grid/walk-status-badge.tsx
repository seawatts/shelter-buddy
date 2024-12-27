"use client";

import { Check, Circle, Timer } from "lucide-react";

import type { AnimalType } from "@acme/db/schema";

import {
  formatElapsedTime,
  getActiveWalkStartTime,
  getCompletedWalkInfo,
  hasBeenWalkedToday,
  hasWalkInProgress,
} from "./utils";

interface WalkStatusBadgeProps {
  animal: AnimalType;
}

export function WalkStatusBadge({ animal }: WalkStatusBadgeProps) {
  if (hasWalkInProgress(animal)) {
    return (
      <div className="flex items-center gap-1">
        {(() => {
          const startTime = getActiveWalkStartTime(animal);
          if (startTime) {
            return (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="size-3" />
                {formatElapsedTime(startTime)}
              </span>
            );
          }
          return null;
        })()}
        <Circle className="size-4 animate-pulse fill-current text-green-500" />
      </div>
    );
  }

  if (hasBeenWalkedToday(animal)) {
    return (
      <div className="flex items-center gap-1">
        {(() => {
          const completedWalk = getCompletedWalkInfo(animal);
          if (completedWalk) {
            return (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="size-3" />
                {completedWalk.duration}
              </span>
            );
          }
          return null;
        })()}
        <Check className="size-4 stroke-[4px] text-green-500" />
      </div>
    );
  }

  return null;
}
