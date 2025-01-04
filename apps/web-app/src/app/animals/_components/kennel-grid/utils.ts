import {
  differenceInMinutes,
  formatDuration as formatDurationFns,
  intervalToDuration,
  isSameDay,
  isToday,
} from "date-fns";

import type {
  AnimalTypeWithRelations,
  KennelType,
  WalkType,
} from "@acme/db/schema";

export function matchesFilters(
  animal: AnimalTypeWithRelations,
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

export function hasBeenWalkedToday(animal: AnimalTypeWithRelations): boolean {
  return animal.walks.some((walk) => isToday(walk.startedAt));
}

export function hasWalkInProgress(
  animal: AnimalTypeWithRelations,
): WalkType | undefined {
  const walk = animal.walks.find(
    (walk) =>
      walk.status === "in_progress" && isSameDay(walk.startedAt, new Date()),
  );
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

export function getActiveWalkStartTime(
  animal: AnimalTypeWithRelations,
): Date | null {
  if (animal.walks.length === 0) return null;

  const activeWalk = animal.walks.find(
    (walk) =>
      walk.status === "in_progress" && isSameDay(walk.startedAt, new Date()),
  );

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
  animal: AnimalTypeWithRelations,
): { completedTime: Date; duration: number } | null {
  if (animal.walks.length === 0) return null;

  const completedWalk = animal.walks.find(
    (walk) =>
      walk.status === "completed" &&
      walk.endedAt &&
      isSameDay(walk.startedAt, new Date()),
  );

  if (!completedWalk?.endedAt) return null;

  const durationInMinutes = differenceInMinutes(
    completedWalk.endedAt,
    completedWalk.startedAt,
  );

  return {
    completedTime: completedWalk.endedAt,
    duration: durationInMinutes,
  };
}

export function formatDuration(minutes: number): string {
  return formatDurationFns({ minutes }, { format: ["hours", "minutes"] })
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" minutes", "m")
    .replace(" minute", "m");
}

export function getLastCompletedWalk(
  animal: AnimalTypeWithRelations,
): { endedAt: Date; duration: number } | undefined {
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
    duration: durationInMinutes,
    endedAt: lastWalk.endedAt,
  };
}
