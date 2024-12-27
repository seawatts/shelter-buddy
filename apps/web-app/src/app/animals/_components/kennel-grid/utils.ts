import { differenceInMinutes, intervalToDuration, isToday } from "date-fns";

import type { AnimalType, KennelType, WalkType } from "@acme/db/schema";

export function matchesFilters(
  animal: AnimalType,
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
      !selectedTags.some((tag) => animal.tags.some((t) => t.tag === tag))
    ) {
      return false;
    }
  }

  return true;
}

export function hasBeenWalkedToday(animal: AnimalType): boolean {
  return animal.walks.some((walk) => isToday(walk.startedAt));
}

export function hasWalkInProgress(animal: AnimalType): WalkType | undefined {
  const walk = animal.walks.find((walk) => !walk.endedAt);
  if (!walk) return undefined;

  return walk;
}

export function sortKennels(kennels: KennelType[]): KennelType[] {
  return [...kennels].sort((a, b) => {
    const aNumber = Number.parseInt(a.id.replaceAll(/\D/g, ""));
    const bNumber = Number.parseInt(b.id.replaceAll(/\D/g, ""));
    return aNumber - bNumber;
  });
}

export function arrangeKennels(
  kennels: KennelType[],
): [KennelType[], KennelType[]] {
  const midpoint = Math.ceil(kennels.length / 2);

  // First column: bottom to top
  const firstColumn = kennels.slice(0, midpoint).reverse();

  // Second column: top to bottom
  const secondColumn = kennels.slice(midpoint);

  return [firstColumn, secondColumn];
}

export function getActiveWalkStartTime(animal: AnimalType): Date | null {
  if (animal.walks.length === 0) return null;

  const today = new Date().toISOString().split("T")[0];
  const activeWalk = animal.walks.find((walk) => {
    if (walk.status !== "in_progress") return false;
    const walkDate = new Date(walk.startedAt).toISOString().split("T")[0];
    return walkDate === today;
  });

  return activeWalk ? activeWalk.startedAt : null;
}

export function formatElapsedTime(startTime: Date): string {
  const duration = intervalToDuration({
    end: new Date(),
    start: startTime,
  });
  return `${duration.minutes ?? 0}`;
}

export function getCompletedWalkInfo(
  animal: AnimalType,
): { completedTime: Date; duration: number } | null {
  if (animal.walks.length === 0) return null;

  const today = new Date().toISOString().split("T")[0];
  const completedWalk = animal.walks.find((walk) => {
    if (walk.status !== "completed" || !walk.endedAt) return false;
    const walkDate = new Date(walk.startedAt).toISOString().split("T")[0];
    return walkDate === today;
  });

  if (!completedWalk?.endedAt) return null;

  const durationInMinutes = Math.floor(
    (completedWalk.endedAt.getTime() - completedWalk.startedAt.getTime()) /
      (1000 * 60),
  );

  return {
    completedTime: completedWalk.endedAt,
    duration: durationInMinutes,
  };
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function getLastCompletedWalk(
  animal: AnimalType,
): { date: Date; duration: number } | undefined {
  const completedWalks = animal.walks.filter((walk) => walk.endedAt);
  if (completedWalks.length === 0) return undefined;

  const sortedWalks = [...completedWalks].sort((a, b) => {
    if (!a.endedAt || !b.endedAt) return 0;
    return b.endedAt.getTime() - a.endedAt.getTime();
  });

  const lastWalk = sortedWalks[0];
  if (!lastWalk?.endedAt) return undefined;

  const durationInMinutes = differenceInMinutes(
    lastWalk.endedAt,
    lastWalk.startedAt,
  );

  return {
    date: lastWalk.endedAt,
    duration: durationInMinutes,
  };
}
