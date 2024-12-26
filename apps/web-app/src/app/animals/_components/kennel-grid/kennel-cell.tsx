"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  showKennelId?: boolean;
  isDraggingAnimal?: boolean;
}

export function KennelCell({
  kennel,
  showKennelId,
  animal,
  difficultyFilter,
  tagFilter,
  onClick,
  isDraggingAnimal,
}: KennelCellProps) {
  const isWalked = animal ? hasBeenWalkedToday(animal) : false;
  const activeWalk = animal ? hasWalkInProgress(animal) : undefined;
  const hasActiveWalk = Boolean(activeWalk);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    data: { animal, kennel },
    disabled: !animal,
    id: animal?.id ?? kennel.id,
  });

  const style = {
    opacity: isDragging ? 0.5 : undefined,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const isFiltered = animal
    ? !matchesFilters(animal, difficultyFilter, tagFilter)
    : false;
  const isAvailable = kennel.status === "available";
  const isUnderMaintenance = kennel.status === "maintenance";
  const tags = animal?.tags ?? [];

  const shouldReduceOpacity = isFiltered || (isWalked && !hasActiveWalk);
  const isValidDropTarget = !animal && !isUnderMaintenance && isAvailable;

  return (
    <div
      data-kennel-id={kennel.id}
      className={cn(
        "relative flex h-14 items-center justify-between rounded-full border-4 border-[hsl(var(--border-color)/var(--border-opacity))] p-3 transition-all hover:opacity-80",
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
          "cursor-grab": animal,
          "cursor-grabbing": isDragging,
          "cursor-not-allowed": !animal,
          "opacity-50": isUnderMaintenance || shouldReduceOpacity,
          "ring-2 ring-primary ring-offset-2":
            isValidDropTarget && isDraggingAnimal,
          "ring-4 ring-primary": isValidDropTarget && isOver,
        },
      )}
      onClick={onClick}
    >
      {animal ? (
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className="flex min-w-0 flex-1 items-center justify-between"
        >
          <div className="min-w-0 truncate">
            <div className="text-sm font-medium">
              <span
                className={cn({
                  hidden: !(showKennelId ?? true),
                })}
              >
                {kennel.id}
              </span>
              <span className={"ml-1 text-muted-foreground"}>
                {animal.name}
              </span>
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
            {(isWalked || hasActiveWalk) && <WalkStatusBadge animal={animal} />}
          </div>
        </div>
      ) : (
        <div
          ref={setNodeRef}
          className="flex min-w-0 flex-1 items-center justify-between"
        >
          <div className="min-w-0 truncate">
            <div className="text-sm font-medium">{kennel.id}</div>
          </div>
        </div>
      )}
    </div>
  );
}
