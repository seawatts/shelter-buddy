"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";

import type { AnimalTypeWithRelations, KennelType } from "@acme/db/schema";
import { Badge } from "@acme/ui/badge";
import { cn } from "@acme/ui/lib/utils";

import { hasBeenWalkedToday, hasWalkInProgress, matchesFilters } from "./utils";
import { WalkStatusBadge } from "./walk-status-badge";

const kennelCell = cva(
  "relative flex h-14 items-center justify-between rounded-full border-4 p-3 transition-all hover:opacity-80",
  {
    compoundVariants: [
      {
        class: "bg-purple/20",
        difficulty: "purple",
        isOutOfKennel: false,
        walkStatus: "none",
      },
      {
        class: "[&_.cell-content]:opacity-10",
        difficulty: "red",
        isOutOfKennel: [false, true],
        walkStatus: ["none", "walked", "inProgress"],
      },
      {
        class: "bg-yellow/20",
        difficulty: "yellow",
        isOutOfKennel: false,
        walkStatus: "none",
      },
      {
        class:
          "animate-slide-pattern bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--purple)/0.2)_10px,hsl(var(--purple)/0.2)_20px)]",
        difficulty: "purple",
        walkStatus: "inProgress",
      },
      {
        class:
          "animate-slide-pattern bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--red)/0.2)_10px,hsl(var(--red)/0.2)_20px)]",
        difficulty: "red",
        walkStatus: "inProgress",
      },
      {
        class:
          "animate-slide-pattern bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--yellow)/0.2)_10px,hsl(var(--yellow)/0.2)_20px)]",
        difficulty: "yellow",
        walkStatus: "inProgress",
      },
      {
        class: "bg-transparent",
        difficulty: ["purple", "yellow"],
        isOutOfKennel: true,
        walkStatus: ["none", "walked"],
      },
      {
        class: "border-dashed",
        difficulty: "red",
        isOutOfKennel: true,
        walkStatus: ["none", "walked"],
      },
      {
        class: "border-purple/25",
        difficulty: "purple",
        state: ["filtered", "maintenance"],
      },
      {
        class: "border-red/25",
        difficulty: "red",
        state: ["filtered", "maintenance"],
      },
      {
        class: "border-yellow/25",
        difficulty: "yellow",
        state: ["filtered", "maintenance"],
      },
      {
        class: "[&_.cell-content]:opacity-25",
        state: "filtered",
      },
      {
        class: "[&_.cell-content]:opacity-25",
        state: "maintenance",
      },
      {
        class: "[&_.cell-content]:opacity-25",
        walkStatus: "walked",
      },
    ],
    defaultVariants: {
      state: "active",
      walkStatus: "none",
    },
    variants: {
      cursor: {
        grab: "cursor-grab",
        grabbing: "cursor-grabbing",
        notAllowed: "cursor-not-allowed",
      },
      difficulty: {
        purple: "border-purple",
        red: "border-red/10",
        yellow: "border-yellow",
      },
      dropTarget: {
        valid: "ring-2 ring-primary ring-offset-2",
        validAndOver: "ring-4 ring-primary",
      },
      isOutOfKennel: {
        false: "",
        true: "",
      },
      kennelStatus: {
        available: "border-dashed border-muted",
        outOfKennel: "border-dashed",
      },
      state: {
        active: "",
        filtered: "",
        maintenance: "",
      },
      walkStatus: {
        inProgress: "",
        none: "",
        walked: "",
      },
    },
  },
);

interface KennelCellProps {
  kennel: KennelType;
  animal?: AnimalTypeWithRelations;
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
  const isWalked = useMemo(
    () => (animal ? hasBeenWalkedToday(animal) : false),
    [animal],
  );
  const activeWalk = useMemo(
    () => (animal ? hasWalkInProgress(animal) : undefined),
    [animal],
  );
  const hasActiveWalk = Boolean(activeWalk);

  const isFiltered = useMemo(
    () =>
      animal ? !matchesFilters(animal, difficultyFilter, tagFilter) : false,
    [animal, difficultyFilter, tagFilter],
  );

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

  const tags = animal?.tags ?? [];

  const shouldReduceOpacity = isFiltered || (isWalked && !hasActiveWalk);
  const currentKennelOccupant = animal?.kennelOccupants.find((k) => !k.endedAt);
  const isValidDropTarget = Boolean(currentKennelOccupant?.isOutOfKennel);
  const isOutOfKennel = Boolean(currentKennelOccupant?.isOutOfKennel);

  // Compute variants
  const cursorVariant = (() => {
    if (!animal) return "notAllowed";
    return isDragging ? "grabbing" : "grab";
  })();

  const dropTargetVariant = (() => {
    if (!isValidDropTarget || !isDraggingAnimal) return undefined;
    return isOver ? "validAndOver" : "valid";
  })();

  const kennelStatusVariant = (() => {
    if (isOutOfKennel) return "outOfKennel";
    return undefined;
  })();

  const stateVariant = (() => {
    if (shouldReduceOpacity) return "filtered";
    return "active";
  })();

  const walkStatusVariant = (() => {
    if (hasActiveWalk) return "inProgress";
    if (isWalked) return "walked";
    return "none";
  })();

  return (
    <div
      data-kennel-id={kennel.id}
      className={cn(
        kennelCell({
          cursor: cursorVariant,
          difficulty: animal?.difficultyLevel.toLowerCase() as
            | "purple"
            | "red"
            | "yellow"
            | undefined,
          dropTarget: dropTargetVariant,
          isOutOfKennel,
          kennelStatus: kennelStatusVariant,
          state: stateVariant,
          walkStatus: walkStatusVariant,
        }),
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
                {kennel.name}
              </span>
              <span className="cell-content ml-1 text-muted-foreground">
                {animal.name}
              </span>
            </div>
          </div>

          <div className="cell-content flex items-center gap-2">
            {!isWalked && !hasActiveWalk && tags.length > 0 && (
              <div className="flex gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className={cn(
                      "rounded-full text-xs",
                      tag.tag === "first" && "bg-gray-500 dark:bg-gray-400",
                      tag.tag === "last" && "bg-gray-400 dark:bg-gray-500",
                    )}
                  >
                    {tag.tag}
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
            <div className="text-sm font-medium">{kennel.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}
