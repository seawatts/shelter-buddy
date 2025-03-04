import type { DragEndEvent, DragStartEvent, Modifier } from "@dnd-kit/core";
import { useId } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

import type { AnimalTypeWithRelations, KennelType } from "@acme/db/schema";

import { KennelCell } from "../kennel-cell";

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 65,
  };
};

interface DndContextWrapperProps {
  children: React.ReactNode;
  kennels: KennelType[];
  animals: AnimalTypeWithRelations[];
  difficultyFilter: string | null;
  tagFilter: string | null;
  activeId: string | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export function DndContextWrapper({
  children,
  kennels,
  animals,
  difficultyFilter,
  tagFilter,
  activeId,
  onDragStart,
  onDragEnd,
}: DndContextWrapperProps) {
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

  const activeAnimal = activeId
    ? animals.find((a) => a.id === activeId)
    : undefined;
  const activeKennel = activeAnimal
    ? activeAnimal.kennelOccupants.find(
        (k) => k.kennelId === activeId && !k.endedAt,
      )
    : null;
  const id = useId();

  return (
    <DndContext
      id={id}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={kennels.map((k) => k.id)}>
        {children}
      </SortableContext>

      <DragOverlay dropAnimation={null} modifiers={[adjustTranslate]}>
        {activeId && activeKennel && activeAnimal && (
          <KennelCell
            showKennelId={false}
            kennel={activeKennel.kennel}
            animal={activeAnimal}
            difficultyFilter={difficultyFilter}
            tagFilter={tagFilter}
            onClick={() => void 0}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
