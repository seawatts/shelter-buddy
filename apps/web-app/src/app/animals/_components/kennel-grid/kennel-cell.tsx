"use client";

import { Badge } from "@acme/ui/badge";
import { cn } from "@acme/ui/lib/utils";

import type { Animal, Kennel } from "../../types";
import { hasBeenWalkedToday, hasWalkInProgress, matchesFilters } from "./utils";
import { WalkStatusBadge } from "./walk-status-badge";

interface KennelCellProps {
  kennel: Kennel;
  animal?: Animal;
  difficultyFilter?: string | null;
  tagFilter?: string | null;
  onClick: () => void;
}

export function KennelCell({
  kennel,
  animal,
  difficultyFilter,
  tagFilter,
  onClick,
}: KennelCellProps) {
  const isFiltered = animal
    ? !matchesFilters(animal, difficultyFilter, tagFilter)
    : false;
  const isWalked = animal ? hasBeenWalkedToday(animal) : false;
  const hasActiveWalk = animal ? hasWalkInProgress(animal) : false;
  const isAvailable = kennel.status === "available";
  const isUnderMaintenance = kennel.status === "maintenance";
  const tags = animal?.tags ?? [];

  const shouldReduceOpacity = isFiltered || (isWalked && !hasActiveWalk);

  return (
    <div
      data-kennel-id={kennel.id}
      className={cn(
        "relative flex h-14 items-center justify-between rounded-full border-4 border-[hsl(var(--border-color)/var(--border-opacity))] p-3 transition-opacity hover:opacity-80",
        {
          "[--border-color:var(--chart-3)]":
            animal?.difficultyLevel === "Yellow",
          "[--border-color:var(--chart-4)]":
            animal?.difficultyLevel === "Purple",
          "[--border-color:var(--chart-5)]": animal?.difficultyLevel === "Red",
          "[--border-opacity:0.25]": shouldReduceOpacity,
          "[--border-opacity:1]": !shouldReduceOpacity,
          "[background-color:hsl(var(--chart-3)/0.2)]":
            animal?.difficultyLevel === "Yellow" &&
            !isWalked &&
            !hasActiveWalk &&
            !isFiltered &&
            !animal.isOutOfKennel,
          "[background-color:hsl(var(--chart-4)/0.2)]":
            animal?.difficultyLevel === "Purple" &&
            !isWalked &&
            !hasActiveWalk &&
            !isFiltered &&
            !animal.isOutOfKennel,
          "[background-color:hsl(var(--chart-5)/0.2)]":
            animal?.difficultyLevel === "Red" &&
            !isWalked &&
            !hasActiveWalk &&
            !isFiltered &&
            !animal.isOutOfKennel,
          "animate-slide-pattern [background:repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--chart-3)/0.2)_10px,hsl(var(--chart-3)/0.2)_20px)]":
            animal?.difficultyLevel === "Yellow" && hasActiveWalk,
          "animate-slide-pattern [background:repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--chart-4)/0.2)_10px,hsl(var(--chart-4)/0.2)_20px)]":
            animal?.difficultyLevel === "Purple" && hasActiveWalk,
          "animate-slide-pattern [background:repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--chart-5)/0.2)_10px,hsl(var(--chart-5)/0.2)_20px)]":
            animal?.difficultyLevel === "Red" && hasActiveWalk,
          "bg-card": !animal?.isOutOfKennel || hasActiveWalk,
          "border-dashed": isAvailable || animal?.isOutOfKennel,
          "border-muted": isAvailable,
          "cursor-not-allowed": !animal,
          "cursor-pointer": animal,
          "opacity-50": isUnderMaintenance || shouldReduceOpacity,
        },
      )}
      onClick={onClick}
    >
      <div className="min-w-0 truncate">
        <div className="text-sm font-medium">
          {kennel.id}
          {animal && (
            <span className="ml-1 text-muted-foreground">{animal.name}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isWalked && !hasActiveWalk && tags.length > 0 && (
          <div className="flex gap-1">
            {tags.map((tag) => (
              <Badge
                key={tag}
                className={cn(
                  "rounded-full text-xs",
                  tag === "first" && "bg-gray-500",
                  tag === "last" && "bg-gray-400",
                )}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {animal && (isWalked || hasActiveWalk) && (
          <WalkStatusBadge animal={animal} />
        )}
      </div>
    </div>
  );
}
