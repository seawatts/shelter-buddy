"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useQueryState } from "nuqs";

import type { Animal, Kennel } from "../../types";
import { KennelActions } from "./kennel-actions";
import { KennelCell } from "./kennel-cell";
import { arrangeKennels, sortKennels } from "./utils";

interface KennelGridProps {
  animals: Animal[];
  kennels: Kennel[];
}

export function KennelGrid(props: KennelGridProps) {
  const [selectedKennel, setSelectedKennel] = useState<Kennel | null>(null);
  const [difficultyFilter] = useQueryState("difficultyFilter");
  const [tagFilter] = useQueryState("tagFilter");

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
      const animal = props.animals.find((a) => a.kennelId === kennel.id);
      if (!animal || !selectedFilters.includes(animal.difficultyLevel))
        return false;

      // Check if the animal has been walked today or has a walk in progress
      const walks = Object.values(animal.walks).filter((walk) => {
        const walkDate = new Date(walk.date).toISOString().split("T")[0];
        return walkDate === today;
      });

      const hasBeenWalked = walks.some((walk) => walk.status === "completed");
      const hasWalkInProgress = walks.some(
        (walk) => walk.status !== "completed" && walk.activities,
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

  return (
    <>
      <div className="flex w-full justify-center">
        <div className="grid w-full grid-cols-2 justify-center gap-3 sm:min-w-[640px] sm:max-w-[800px] sm:gap-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {leftColumn.map((kennel) => (
              <Fragment key={kennel.id}>
                <KennelCell
                  kennel={kennel}
                  animal={props.animals.find(
                    (a) => a.kennelNumber === kennel.id,
                  )}
                  difficultyFilter={difficultyFilter}
                  tagFilter={tagFilter}
                  onClick={() => setSelectedKennel(kennel)}
                />
              </Fragment>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            {rightColumn.map((kennel) => (
              <Fragment key={kennel.id}>
                <KennelCell
                  kennel={kennel}
                  animal={props.animals.find(
                    (a) => a.kennelNumber === kennel.id,
                  )}
                  difficultyFilter={difficultyFilter}
                  tagFilter={tagFilter}
                  onClick={() => setSelectedKennel(kennel)}
                />
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {selectedKennel && (
        <KennelActions
          kennel={selectedKennel}
          animal={props.animals.find(
            (a) => a.kennelNumber === selectedKennel.id,
          )}
          open={Boolean(selectedKennel)}
          onOpenChange={(open) => {
            if (!open) setSelectedKennel(null);
          }}
        />
      )}
    </>
  );
}
