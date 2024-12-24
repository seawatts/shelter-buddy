export type DifficultyLevel = "Purple" | "Yellow" | "Red";

export const DIFFICULTY_COLORS = {
  Purple: "hsl(var(--chart-4))",
  Red: "hsl(var(--chart-5))",
  Yellow: "hsl(var(--chart-3))",
} as const;

export const DIFFICULTY_CONFIG = {
  Purple: {
    color: DIFFICULTY_COLORS.Purple,
    label: "Purple",
  },
  Red: {
    color: DIFFICULTY_COLORS.Red,
    label: "Red",
  },
  Yellow: {
    color: DIFFICULTY_COLORS.Yellow,
    label: "Yellow",
  },
} satisfies Record<DifficultyLevel, { color: string; label: string }>;
