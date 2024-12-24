"use client";

import { useQueryState } from "nuqs";

import type { Animal, Kennel } from "../types";
import { AnimalsTable } from "./animals-table";
import { KennelGrid } from "./kennel-grid";

export function AnimalsView(props: { animals: Animal[]; kennels: Kennel[] }) {
  const [viewMode] = useQueryState("viewMode", { defaultValue: "grid" });

  return viewMode === "table" ? (
    <AnimalsTable animals={props.animals} />
  ) : (
    <KennelGrid animals={props.animals} kennels={props.kennels} />
  );
}
