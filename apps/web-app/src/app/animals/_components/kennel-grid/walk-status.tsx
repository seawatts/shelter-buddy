"use client";

import { useRouter } from "next/navigation";
import { differenceInMinutes } from "date-fns";
import { Download, Play, Square, Timer } from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/lib/utils";

import type { Animal } from "../../types";
import { formatDuration, hasWalkInProgress } from "./utils";

interface WalkStatusProps {
  animal: Animal;
  className?: string;
}

export function WalkStatus({ animal, className }: WalkStatusProps) {
  const router = useRouter();
  const walkInProgress = hasWalkInProgress(animal);

  const handleStartWalk = () => {
    router.push(`/animals/${animal.id}/walk`);
  };

  const handleStopWalk = () => {
    router.push(`/animals/${animal.id}/walk`);
  };

  if (!walkInProgress) {
    if (animal.isOutOfKennel) {
      return (
        <Button
          className="gap-2"
          onClick={() => {
            // TODO: Implement mark in kennel functionality
            console.log("Mark in kennel clicked");
          }}
        >
          <Download className="size-3" />
          Mark In Kennel
        </Button>
      );
    }
    return (
      <Button variant="default" className="gap-2" onClick={handleStartWalk}>
        <Play className="size-3" />
        Start Walk
      </Button>
    );
  }

  const durationInMinutes = differenceInMinutes(
    new Date(),
    walkInProgress.startedAt,
  );

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant="destructive" className="gap-2" onClick={handleStopWalk}>
        <Square className="size-3" />
        Stop Walk
      </Button>
      <Badge
        variant="outline"
        className={cn(
          "flex items-center gap-1 rounded-full border-2 border-primary px-2 py-0.5 text-xs font-medium text-primary",
          className,
        )}
      >
        <Timer className="size-3" />
        {formatDuration(durationInMinutes)}
      </Badge>
    </div>
  );
}
