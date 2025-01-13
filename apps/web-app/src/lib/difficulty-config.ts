export type DifficultyLevel = "Purple" | "Yellow" | "Red";

export const DIFFICULTY_COLORS = {
  Purple: "hsl(var(--purple))",
  Red: "hsl(var(--red))",
  Yellow: "hsl(var(--yellow))",
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
