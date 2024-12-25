import { intervalToDuration } from "date-fns";

import type { Animal, Kennel } from "../../types";

export function matchesFilters(
  animal: Animal,
  difficultyFilter?: string | null,
  tagFilter?: string | null,
) {
  // Check difficulty filter
  if (difficultyFilter) {
    const selectedDifficulties = difficultyFilter.split(",").filter(Boolean);
    if (
      selectedDifficulties.length > 0 &&
      !selectedDifficulties.includes(animal.difficultyLevel)
    ) {
      return false;
    }
  }

  // Check tag filter
  if (tagFilter) {
    const selectedTags = tagFilter.split(",").filter(Boolean);
    if (
      selectedTags.length > 0 &&
      !selectedTags.some((tag) => animal.tags?.includes(tag))
    ) {
      return false;
    }
  }

  return true;
}

export function hasBeenWalkedToday(animal: Animal) {
  const today = new Date().toISOString().split("T")[0];
  return Object.values(animal.walks).some((walk) => {
    if (walk.status !== "completed") return false;
    const walkDate = new Date(walk.date).toISOString().split("T")[0];
    return walkDate === today;
  });
}

export function hasWalkInProgress(animal: Animal) {
  const today = new Date().toISOString().split("T")[0];
  return Object.values(animal.walks).some((walk) => {
    if (walk.status !== "in_progress") return false;
    const walkDate = new Date(walk.date).toISOString().split("T")[0];
    return walkDate === today;
  });
}

export function sortKennels(kennels: Kennel[]): Kennel[] {
  return [...kennels].sort((a, b) => {
    const aNumber = Number.parseInt(a.id.replaceAll(/\D/g, ""));
    const bNumber = Number.parseInt(b.id.replaceAll(/\D/g, ""));
    return aNumber - bNumber;
  });
}

export function arrangeKennels(kennels: Kennel[]): [Kennel[], Kennel[]] {
  const midpoint = Math.ceil(kennels.length / 2);

  // First column: bottom to top
  const firstColumn = kennels.slice(0, midpoint).reverse();

  // Second column: top to bottom
  const secondColumn = kennels.slice(midpoint);

  return [firstColumn, secondColumn];
}

export function getActiveWalkStartTime(animal: Animal): Date | null {
  const today = new Date().toISOString().split("T")[0];
  const activeWalk = Object.values(animal.walks).find((walk) => {
    if (walk.status !== "in_progress") return false;
    const walkDate = new Date(walk.date).toISOString().split("T")[0];
    return walkDate === today;
  });

  return activeWalk ? new Date(activeWalk.date) : null;
}

export function formatElapsedTime(startTime: Date): string {
  const duration = intervalToDuration({
    end: new Date(),
    start: startTime,
  });
  return `${duration.minutes ?? 0}`;
}

export function getCompletedWalkInfo(
  animal: Animal,
): { completedTime: string; duration: number } | null {
  const today = new Date().toISOString().split("T")[0];
  const completedWalk = Object.values(animal.walks).find((walk) => {
    if (walk.status !== "completed") return false;
    const walkDate = new Date(walk.date).toISOString().split("T")[0];
    return walkDate === today;
  });

  if (!completedWalk?.duration) return null;

  return {
    completedTime: completedWalk.date,
    duration: completedWalk.duration, // Convert minutes to seconds
  };
}

export function formatDuration(durationInSeconds: number): string {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function getLastCompletedWalk(animal: Animal) {
  const completedWalks = Object.values(animal.walks)
    .filter((walk) => walk.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (completedWalks.length === 0) return null;

  const lastWalk = completedWalks[0];
  return {
    date: lastWalk?.date,
    duration: lastWalk?.duration ?? 0,
  };
}
