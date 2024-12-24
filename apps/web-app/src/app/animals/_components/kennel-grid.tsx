"use client";

import { Fragment, useEffect, useMemo } from "react";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { useQueryState } from "nuqs";

import { cn } from "@acme/ui/lib/utils";

import type { Animal, Kennel } from "../types";

interface KennelGridProps {
  animals: Animal[];
  kennels: Kennel[];
}

function matchesFilters(animal: Animal, difficultyFilter?: string | null) {
  if (!difficultyFilter) {
    return true;
  }

  const selectedFilters = difficultyFilter.split(",").filter(Boolean);
  if (selectedFilters.length === 0) {
    return true;
  }

  return selectedFilters.includes(animal.difficultyLevel);
}

function hasBeenWalkedToday(animal: Animal) {
  const today = new Date().toISOString().split("T")[0];
  return Object.values(animal.walks).some((walk) => {
    if (!walk.completed) return false;
    const walkDate = new Date(walk.time).toISOString().split("T")[0];
    return walkDate === today;
  });
}

function hasWalkInProgress(animal: Animal) {
  const today = new Date().toISOString().split("T")[0];
  return Object.values(animal.walks).some((walk) => {
    if (walk.completed) return false;
    if (!walk.activities) return false;
    const walkDate = new Date(walk.time).toISOString().split("T")[0];
    return walkDate === today;
  });
}

function sortKennels(kennels: Kennel[]): Kennel[] {
  return [...kennels].sort((a, b) => {
    const aNumber = Number.parseInt(a.id.replaceAll(/\D/g, ""));
    const bNumber = Number.parseInt(b.id.replaceAll(/\D/g, ""));
    return aNumber - bNumber;
  });
}

function arrangeKennels(kennels: Kennel[]): [Kennel[], Kennel[]] {
  const midpoint = Math.ceil(kennels.length / 2);

  // First column: bottom to top
  const firstColumn = kennels.slice(0, midpoint).reverse();

  // Second column: top to bottom
  const secondColumn = kennels.slice(midpoint);

  return [firstColumn, secondColumn];
}

export function KennelGrid(props: KennelGridProps) {
  const [difficultyFilter] = useQueryState("difficultyFilter");

  // Sort kennels once and memoize the result
  const sortedKennels = useMemo(
    () => sortKennels(props.kennels),
    [props.kennels],
  );
  const [leftColumn, rightColumn] = useMemo(
    () => arrangeKennels(sortedKennels),
    [sortedKennels],
  );

  // Effect to handle scrolling when filter changes
  useEffect(() => {
    if (!difficultyFilter) return;

    const selectedFilters = difficultyFilter.split(",");
    if (selectedFilters.length === 0) return;

    const today = new Date().toISOString().split("T")[0];

    // Find the first visible kennel that matches the filter and hasn't been walked
    const firstMatchingKennel = sortedKennels.find((kennel) => {
      const animal = props.animals.find((a) => a.kennelNumber === kennel.id);
      if (!animal || !selectedFilters.includes(animal.difficultyLevel))
        return false;

      // Check if the animal has been walked today or has a walk in progress
      const walks = Object.values(animal.walks).filter((walk) => {
        const walkDate = new Date(walk.time).toISOString().split("T")[0];
        return walkDate === today;
      });

      const hasBeenWalked = walks.some((walk) => walk.completed);
      const hasWalkInProgress = walks.some(
        (walk) => !walk.completed && walk.activities,
      );

      // Only match if the animal hasn't been walked and doesn't have a walk in progress
      return !hasBeenWalked && !hasWalkInProgress;
    });

    if (firstMatchingKennel) {
      const kennelElement = document.querySelector(
        `[data-kennel-id="${firstMatchingKennel.id}"]`,
      );
      if (kennelElement) {
        kennelElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [difficultyFilter, sortedKennels, props.animals]);

  const renderKennel = (kennel: Kennel) => {
    const animal = props.animals.find((a) => a.kennelNumber === kennel.id);
    const isFiltered = animal
      ? !matchesFilters(animal, difficultyFilter)
      : false;
    const isWalked = animal ? hasBeenWalkedToday(animal) : false;
    const hasActiveWalk = animal ? hasWalkInProgress(animal) : false;
    const isAvailable = kennel.status === "available";
    const isUnderMaintenance = kennel.status === "maintenance";

    const kennelContent = (
      <div
        data-kennel-id={kennel.id}
        className={cn(
          "flex h-14 items-center justify-between rounded-full border-4 border-[hsl(var(--border-color)/var(--border-opacity))] bg-card p-3 transition-opacity hover:opacity-80",
          {
            "[--border-color:var(--chart-3)]":
              animal?.difficultyLevel === "Yellow" && isWalked,
            "[--border-color:var(--chart-3)] [background-color:hsl(var(--chart-3)/0.2)]":
              animal?.difficultyLevel === "Yellow" &&
              !isWalked &&
              !hasActiveWalk,
            "[--border-color:var(--chart-4)]":
              animal?.difficultyLevel === "Purple" && isWalked,
            "[--border-color:var(--chart-4)] [background-color:hsl(var(--chart-4)/0.2)]":
              animal?.difficultyLevel === "Purple" &&
              !isWalked &&
              !hasActiveWalk,
            "[--border-color:var(--chart-5)]":
              animal?.difficultyLevel === "Red" && isWalked,
            "[--border-color:var(--chart-5)] [background-color:hsl(var(--chart-5)/0.2)]":
              animal?.difficultyLevel === "Red" && !isWalked && !hasActiveWalk,
            "[--border-opacity:1]": !(
              isFiltered ||
              (isWalked && !hasActiveWalk) ||
              animal?.difficultyLevel === "Red"
            ),
            "animate-slide-pattern [background:repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--chart-3)/0.2)_10px,hsl(var(--chart-3)/0.2)_20px)]":
              animal?.difficultyLevel === "Yellow" && hasActiveWalk,
            "animate-slide-pattern [background:repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--chart-4)/0.2)_10px,hsl(var(--chart-4)/0.2)_20px)]":
              animal?.difficultyLevel === "Purple" && hasActiveWalk,
            "animate-slide-pattern [background:repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--chart-5)/0.2)_10px,hsl(var(--chart-5)/0.2)_20px)]":
              animal?.difficultyLevel === "Red" && hasActiveWalk,
            "border-dashed border-muted": isAvailable,
            "cursor-not-allowed": !animal,
            "cursor-pointer": animal,
            "opacity-50": isUnderMaintenance,
            "opacity-50 [--border-opacity:0.25]":
              isFiltered ||
              (isWalked && !hasActiveWalk) ||
              animal?.difficultyLevel === "Red",
          },
        )}
      >
        <div className="min-w-0 truncate">
          <div className="text-sm font-medium">{kennel.id}</div>
        </div>
        {(isWalked || hasActiveWalk) && (
          <div className="text-green-500">
            {hasActiveWalk ? (
              <Circle className="size-4 animate-pulse fill-current" />
            ) : (
              <Check className="size-5 stroke-[4px]" />
            )}
          </div>
        )}
      </div>
    );

    return (
      <div key={kennel.id}>
        {animal ? (
          <Link href={`/animals/${animal.id}`}>{kennelContent}</Link>
        ) : (
          kennelContent
        )}
      </div>
    );
  };

  return (
    <div className="flex w-full justify-center">
      <div className="grid w-full grid-cols-2 justify-center gap-3 sm:min-w-[640px] sm:max-w-[800px] sm:gap-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {leftColumn.map((kennel) => (
            <Fragment key={kennel.id}>{renderKennel(kennel)}</Fragment>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:gap-4">
          {rightColumn.map((kennel) => (
            <Fragment key={kennel.id}>{renderKennel(kennel)}</Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
