"use client";

import { useQueryState } from "nuqs";

import type { Animal, Kennel } from "../types";
import { AnimalsTable } from "./animals-table";
import { KennelGrid } from "./kennel-grid";

export function AnimalsView(props: { animals: Animal[]; kennels: Kennel[] }) {
  const [viewMode] = useQueryState("viewMode", { defaultValue: "grid" });
  const [tagFilter] = useQueryState("tagFilter");

  const selectedTags = tagFilter?.split(",").filter(Boolean) ?? [];

  // Filter animals by tags if any are selected
  const filteredAnimals =
    selectedTags.length > 0
      ? props.animals.filter((animal) =>
          selectedTags.some((tag) => animal.tags?.includes(tag)),
        )
      : props.animals;

  return (
    <div className="space-y-6">
      {viewMode === "table" ? (
        <AnimalsTable animals={filteredAnimals} />
      ) : (
        <KennelGrid animals={filteredAnimals} kennels={props.kennels} />
      )}
    </div>
  );
}
