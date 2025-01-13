import {
  formatDuration as formatDurationFns,
  intervalToDuration,
} from "date-fns";

export function formatDuration(minutes: number): string {
  return formatDurationFns({ minutes }, { format: ["hours", "minutes"] })
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" minutes", "m")
    .replace(" minute", "m");
}

export function formatElapsedTime(startTime: Date): string {
  const duration = intervalToDuration({
    end: new Date(),
    start: startTime,
  });
  return `${duration.minutes ?? 0}`;
}
