"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Circle, Timer } from "lucide-react";

import type { AnimalTypeWithRelations } from "@acme/db/schema";

import { formatDuration } from "~/utils/date-time-helpers";
import {
  getActiveWalkStartTime,
  getCompletedWalkInfo,
  hasBeenWalkedToday,
  hasWalkInProgress,
} from "../utils";

interface WalkStatusBadgeProps {
  animal: AnimalTypeWithRelations;
}

export function WalkStatusBadge({ animal }: WalkStatusBadgeProps) {
  const walkInProgress = useMemo(() => hasWalkInProgress(animal), [animal]);
  const startTime = useMemo(() => getActiveWalkStartTime(animal), [animal]);
  const isWalkedToday = useMemo(() => hasBeenWalkedToday(animal), [animal]);
  const completedWalkInfo = useMemo(
    () => getCompletedWalkInfo(animal),
    [animal],
  );

  // Initialize with 0 to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Only start updating time after component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !startTime) return;

    const calculateElapsedMinutes = () => {
      const startTimeMs = startTime.getTime();
      return Math.floor((Date.now() - startTimeMs) / (1000 * 60));
    };

    setElapsedMinutes(calculateElapsedMinutes());

    const interval = setInterval(() => {
      setElapsedMinutes(calculateElapsedMinutes());
    }, 1000);

    return () => clearInterval(interval);
  }, [mounted, startTime]);

  const formattedElapsedTime = useMemo(
    () => formatDuration(elapsedMinutes),
    [elapsedMinutes],
  );

  if (walkInProgress) {
    return (
      <div className="flex items-center gap-1">
        {startTime && mounted && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Timer className="size-3" />
            {formattedElapsedTime}
          </span>
        )}
        <Circle className="size-4 animate-pulse fill-current text-green-500" />
      </div>
    );
  }

  if (isWalkedToday) {
    return (
      <div className="flex items-center gap-1">
        {completedWalkInfo && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Timer className="size-3" />
            {completedWalkInfo.duration}
          </span>
        )}
        <Check className="size-4 stroke-[4px] text-green-500" />
      </div>
    );
  }

  return null;
}
