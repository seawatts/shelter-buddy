"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";

import { Badge } from "@acme/ui/badge";
import { cn } from "@acme/ui/lib/utils";

import type { Animal, Kennel } from "../../types";
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
        class: "bg-red/20",
        difficulty: "red",
        isOutOfKennel: false,
        walkStatus: "none",
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
        red: "border-red",
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
        filtered: "opacity-50",
        maintenance: "opacity-50",
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
    if (isAvailable) return "available";
    if (animal?.isOutOfKennel) return "outOfKennel";
    return undefined;
  })();

  const stateVariant = (() => {
    if (isUnderMaintenance) return "maintenance";
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
          isOutOfKennel: animal?.isOutOfKennel ?? false,
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
                      tag === "first" && "bg-gray-500 dark:bg-gray-400",
                      tag === "last" && "bg-gray-400 dark:bg-gray-500",
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
