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

import type { Animal, Kennel } from "../../types";
import { KennelActions } from "./kennel-actions";
import { KennelCell } from "./kennel-cell";
import { arrangeKennels, sortKennels } from "./utils";

interface KennelGridProps {
  animals: Animal[];
  kennels: Kennel[];
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
  const [selectedKennel, setSelectedKennel] = useState<Kennel | null>(null);
  const [difficultyFilter] = useQueryState("difficultyFilter");
  const [tagFilter] = useQueryState("tagFilter");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for drag and drop
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // 10px of movement required before activation
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // Wait this many ms before activating
      tolerance: 5, // Allow 5px of movement during delay
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

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
      const todayWalks = animal.walks?.filter((walk) => {
        const walkDate = new Date(walk.startedAt).toISOString().split("T")[0];
        return walkDate === today;
      });

      const hasBeenWalked = todayWalks?.some(
        (walk) => walk.status === "completed",
      );
      const hasWalkInProgress = todayWalks?.some(
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

      props.onAnimalMove?.(activeAnimalId, fromKennelId, overKennelId);
    },
    [props],
  );

  const activeAnimal = activeId
    ? props.animals.find((a) => a.id === activeId)
    : undefined;
  const activeKennel = activeAnimal
    ? props.kennels.find((k) => k.id === activeAnimal.kennelId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full justify-center">
        <div className="grid w-full grid-cols-2 justify-center gap-3 sm:min-w-[640px] sm:max-w-[800px] sm:gap-4">
          <SortableContext items={leftColumn.map((k) => k.id)}>
            <div className="flex flex-col gap-3 sm:gap-4">
              {leftColumn.map((kennel) => (
                <Fragment key={kennel.id}>
                  <KennelCell
                    kennel={kennel}
                    animal={props.animals.find((a) => a.kennelId === kennel.id)}
                    difficultyFilter={difficultyFilter}
                    tagFilter={tagFilter}
                    isDraggingAnimal={Boolean(activeId)}
                    onClick={() => setSelectedKennel(kennel)}
                  />
                </Fragment>
              ))}
            </div>
          </SortableContext>
          <SortableContext items={rightColumn.map((k) => k.id)}>
            <div className="flex flex-col gap-3 sm:gap-4">
              {rightColumn.map((kennel) => (
                <Fragment key={kennel.id}>
                  <KennelCell
                    kennel={kennel}
                    animal={props.animals.find((a) => a.kennelId === kennel.id)}
                    difficultyFilter={difficultyFilter}
                    tagFilter={tagFilter}
                    isDraggingAnimal={Boolean(activeId)}
                    onClick={() => setSelectedKennel(kennel)}
                  />
                </Fragment>
              ))}
            </div>
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
