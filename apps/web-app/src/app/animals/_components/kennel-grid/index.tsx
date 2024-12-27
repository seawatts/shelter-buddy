"use client";

import type { DragEndEvent, DragStartEvent, Modifier } from "@dnd-kit/core";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useQueryState } from "nuqs";

import type { AnimalType, KennelType } from "@acme/db/schema";

import { KennelActions } from "./kennel-actions";
import { KennelCell } from "./kennel-cell";
import { sortKennels } from "./utils";

interface KennelGridProps {
  animals: AnimalType[];
  kennels: KennelType[];
  onAnimalMove?: (
    animalId: string,
    fromKennelId: string,
    toKennelId: string,
  ) => void;
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 65,
  };
};

export function KennelGrid(props: KennelGridProps) {
  const [selectedKennel, setSelectedKennel] = useState<KennelType | null>(null);
  const [difficultyFilter] = useQueryState("difficultyFilter");
  const [tagFilter] = useQueryState("tagFilter");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for drag and drop
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

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

    const today = new Date().toISOString().split("T")[0];

    // Find the first visible kennel that matches the filter and hasn't been walked
    const firstMatchingKennel = sortedKennels.find((kennel) => {
      const animal = props.animals.find((a) => a.kennelId === kennel.id);
      if (!animal || !selectedFilters.includes(animal.difficultyLevel))
        return false;

      // Check if the animal has been walked today or has a walk in progress
      const todayWalks = animal.walks.filter((walk) => {
        const walkDate = new Date(walk.startedAt).toISOString().split("T")[0];
        return walkDate === today;
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

      const fromKennelId = activeAnimal.kennelId;
      if (fromKennelId === overKennelId) return;

      props.onAnimalMove?.(activeAnimalId, fromKennelId ?? "", overKennelId);
    },
    [props],
  );

  const activeAnimal = activeId
    ? props.animals.find((a) => a.id === activeId)
    : undefined;
  const activeKennel = activeAnimal
    ? props.kennels.find((k) => k.id === activeAnimal.kennelId)
    : null;

  const numberOfCols = Math.max(...sortedKennels.map((k) => k.gridX)) + 1;
  const numberOfRows = Math.max(...sortedKennels.map((k) => k.gridY)) + 1;
  const halfCols = Math.ceil(numberOfCols / 2);
  const halfRows = Math.ceil(numberOfRows / 2);
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full justify-center">
        <div
          className="grid w-full grid-cols-2 justify-center gap-3 sm:min-w-[640px] sm:max-w-[800px] sm:gap-4"
          style={{
            // gridTemplateColumns: `repeat(${halfCols}, minmax(200px, 1fr))`,
            gridTemplateRows: `repeat(${halfRows}, minmax(0, 1fr))`,
          }}
        >
          <SortableContext items={sortedKennels.map((k) => k.id)}>
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
                    animal={props.animals.find((a) => a.kennelId === kennel.id)}
                    difficultyFilter={difficultyFilter}
                    tagFilter={tagFilter}
                    isDraggingAnimal={Boolean(activeId)}
                    onClick={() => setSelectedKennel(kennel)}
                  />
                </div>
              </Fragment>
            ))}
          </SortableContext>
        </div>
      </div>

      <DragOverlay dropAnimation={null} modifiers={[adjustTranslate]}>
        {activeId && activeKennel && activeAnimal && (
          <KennelCell
            showKennelId={false}
            kennel={activeKennel}
            animal={activeAnimal}
            difficultyFilter={difficultyFilter}
            tagFilter={tagFilter}
            onClick={() => void 0}
          />
        )}
      </DragOverlay>

      {selectedKennel && (
        <KennelActions
          kennel={selectedKennel}
          animal={props.animals.find((a) => a.kennelId === selectedKennel.id)}
          open={Boolean(selectedKennel)}
          onOpenChange={(open) => {
            if (!open) setSelectedKennel(null);
          }}
        />
      )}
    </DndContext>
  );
}
