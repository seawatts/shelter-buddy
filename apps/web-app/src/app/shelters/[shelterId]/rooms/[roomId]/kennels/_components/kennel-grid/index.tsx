"use client";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { isSameDay } from "date-fns";
import { useQueryState } from "nuqs";

import type { AnimalTypeWithRelations, KennelType } from "@acme/db/schema";

import { KennelCell } from "../kennel-cell";
import { KennelCellDialog } from "../kennel-cell-dialog";
import { sortKennels } from "../utils";
import { DndContextWrapper } from "./dnd-context";

interface KennelGridProps {
  animals: AnimalTypeWithRelations[];
  kennels: KennelType[];
  onAnimalMove?: (
    animalId: string,
    fromKennelId: string,
    toKennelId: string,
  ) => void;
}

export function KennelGrid(props: KennelGridProps) {
  const [selectedKennel, setSelectedKennel] = useState<KennelType | null>(null);
  const [difficultyFilter] = useQueryState("difficultyFilter");
  const [tagFilter] = useQueryState("tagFilter");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sort kennels once and memoize the result
  const sortedKennels = useMemo(
    () => sortKennels(props.kennels),
    [props.kennels],
  );

  // Effect to handle scrolling when filter changes
  useEffect(() => {
    if (!difficultyFilter) return;

    const selectedFilters = difficultyFilter.split(",");
    if (selectedFilters.length === 0) return;

    // Find the first visible kennel that matches the filter and hasn't been walked
    const firstMatchingKennel = sortedKennels.find((kennel) => {
      const animal = props.animals.find((a) =>
        a.kennelOccupants.some((k) => k.kennelId === kennel.id && !k.endedAt),
      );
      if (!animal || !selectedFilters.includes(animal.difficultyLevel))
        return false;

      // Check if the animal has been walked today or has a walk in progress
      const todayWalks = animal.walks.filter((walk) => {
        return isSameDay(new Date(walk.startedAt), new Date());
      });

      const hasBeenWalked = todayWalks.some(
        (walk) => walk.status === "completed",
      );
      const hasWalkInProgress = todayWalks.some(
        (walk) => walk.status === "in_progress",
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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);

      if (!over) return;

      const activeAnimalId = active.id as string;
      const overKennelId = over.id as string;

      const activeAnimal = props.animals.find((a) => a.id === activeAnimalId);
      if (!activeAnimal) return;

      const currentKennelOccupant = activeAnimal.kennelOccupants.find(
        (k) => !k.endedAt,
      );
      if (!currentKennelOccupant) return;

      const fromKennelId = currentKennelOccupant.kennelId;
      if (fromKennelId === overKennelId) return;

      props.onAnimalMove?.(activeAnimalId, fromKennelId, overKennelId);
    },
    [props],
  );

  const numberOfRows = Math.max(...sortedKennels.map((k) => k.gridY)) + 1;
  const halfRows = Math.ceil(numberOfRows / 2);

  return (
    <DndContextWrapper
      kennels={props.kennels}
      animals={props.animals}
      difficultyFilter={difficultyFilter}
      tagFilter={tagFilter}
      activeId={activeId}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full justify-center">
        <div
          className="grid w-full grid-cols-2 justify-center gap-3 sm:min-w-[640px] sm:max-w-[800px] sm:gap-4"
          style={{
            gridTemplateRows: `repeat(${halfRows}, minmax(0, 1fr))`,
          }}
        >
          {sortedKennels.map((kennel) => (
            <Fragment key={kennel.id}>
              <div
                style={{
                  gridColumn: kennel.gridX + 1,
                  gridRow: kennel.gridY + 1,
                }}
              >
                <KennelCell
                  kennel={kennel}
                  animal={props.animals.find((a) =>
                    a.kennelOccupants.some(
                      (k) => k.kennelId === kennel.id && !k.endedAt,
                    ),
                  )}
                  difficultyFilter={difficultyFilter}
                  tagFilter={tagFilter}
                  isDraggingAnimal={Boolean(activeId)}
                  onClick={() => setSelectedKennel(kennel)}
                />
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {selectedKennel && (
        <KennelCellDialog
          kennel={selectedKennel}
          kennels={sortedKennels
            .filter((kennel) => {
              // Check if any animal currently occupies this kennel
              const isOccupied = props.animals.some((animal) =>
                animal.kennelOccupants.some(
                  (occupant) =>
                    occupant.kennelId === kennel.id && !occupant.endedAt,
                ),
              );
              // Only include kennels that are not occupied
              return !isOccupied;
            })
            .sort((a, b) => {
              // Extract numbers from kennel names and compare numerically
              const aNumber = Number.parseInt(a.name);
              const bNumber = Number.parseInt(b.name);
              return aNumber - bNumber;
            })}
          animal={props.animals.find((a) =>
            a.kennelOccupants.some(
              (k) => k.kennelId === selectedKennel.id && !k.endedAt,
            ),
          )}
          open={Boolean(selectedKennel)}
          onOpenChange={(open) => {
            if (!open) setSelectedKennel(null);
          }}
        />
      )}
    </DndContextWrapper>
  );
}
