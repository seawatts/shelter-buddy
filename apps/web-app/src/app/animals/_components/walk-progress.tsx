"use client";

import { Check, Circle } from "lucide-react";
import { useQueryState } from "nuqs";

import { cn } from "@acme/ui/lib/utils";

import type { DifficultyLevel } from "../difficulty-config";
import type { Animal } from "../types";
import { DIFFICULTY_CONFIG } from "../difficulty-config";

interface WalkProgressProps {
  data: Animal[];
}

function isWalkInProgress(walk: Animal["walks"][keyof Animal["walks"]]) {
  if (!walk.time) return false;
  if (walk.completed) return false;
  if (!walk.activities) return false;
  const walkDate = new Date(walk.time).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];
  return walkDate === today;
}

export function WalkProgress({ data }: WalkProgressProps) {
  const [difficultyFilter, setDifficultyFilter] =
    useQueryState("difficultyFilter");

  const selectedFilters = difficultyFilter?.split(",").filter(Boolean) ?? [];

  // Calculate stats for each difficulty level
  const difficultyStats: Record<
    DifficultyLevel,
    { completed: number; inProgress: number; total: number }
  > = {
    Purple: { completed: 0, inProgress: 0, total: 0 },
    Red: { completed: 0, inProgress: 0, total: 0 },
    Yellow: { completed: 0, inProgress: 0, total: 0 },
  };

  // First count how many dogs of each difficulty
  const dogsByDifficulty: Record<DifficultyLevel, number> = {
    Purple: 0,
    Red: 0,
    Yellow: 0,
  };

  // Count dogs per difficulty
  for (const animal of data) {
    dogsByDifficulty[animal.difficultyLevel]++;
  }

  // Set total possible walks (3 per dog)
  for (const [difficulty, count] of Object.entries(dogsByDifficulty)) {
    difficultyStats[difficulty as DifficultyLevel].total = count * 3;
  }

  const today = new Date().toISOString().split("T")[0];

  // Count completed and in-progress walks
  for (const animal of data) {
    const level = animal.difficultyLevel;
    const walks = Object.values(animal.walks).filter((walk) => {
      const walkDate = new Date(walk.time).toISOString().split("T")[0];
      return walkDate === today;
    });

    const completedCount = walks.filter((walk) => walk.completed).length;
    const inProgressCount = walks.filter((walk) =>
      isWalkInProgress(walk),
    ).length;

    difficultyStats[level].completed += completedCount;
    difficultyStats[level].inProgress += inProgressCount;
  }

  const toggleFilter = (level: DifficultyLevel) => {
    const currentFilters = new Set(selectedFilters);
    if (currentFilters.has(level)) {
      // eslint-disable-next-line drizzle/enforce-delete-with-where
      currentFilters.delete(level);
    } else {
      currentFilters.add(level);
    }
    void setDifficultyFilter(
      currentFilters.size > 0 ? [...currentFilters].join(",") : null,
    );
  };

  return (
    <div className="flex w-full justify-center">
      <div className="grid w-full grid-cols-1 gap-4 sm:min-w-[640px] sm:max-w-[800px] md:grid-cols-2">
        {(
          Object.entries(DIFFICULTY_CONFIG) as [
            DifficultyLevel,
            (typeof DIFFICULTY_CONFIG)[DifficultyLevel],
          ][]
        )
          .sort((a, b) => {
            const order = ["Purple", "Yellow", "Red"];
            return order.indexOf(a[0]) - order.indexOf(b[0]);
          })
          .filter(([level]) => level !== "Red")
          .map(([level, config]) => {
            const stats = difficultyStats[level];
            const completedPercentage =
              stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
            const inProgressPercentage =
              stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0;

            return (
              <div key={level} className="space-y-2">
                <div
                  className="relative cursor-pointer transition-opacity hover:opacity-80"
                  onClick={() => toggleFilter(level)}
                >
                  <div
                    className={cn(
                      "relative h-10 w-full overflow-hidden rounded-full border-4 transition-all md:h-12",
                      {
                        "border-[hsl(var(--chart-3))]": level === "Yellow",
                        "border-[hsl(var(--chart-4))]": level === "Purple",
                        "border-[hsl(var(--chart-5))]": level === "Red",
                      },
                      selectedFilters.includes(level) && "ring-2 ring-offset-2",
                      {
                        "[--ring-color:var(--chart-3)]":
                          level === "Yellow" && selectedFilters.includes(level),
                        "[--ring-color:var(--chart-4)]":
                          level === "Purple" && selectedFilters.includes(level),
                      },
                      selectedFilters.includes(level) &&
                        "ring-[hsl(var(--ring-color))]",
                    )}
                    style={{
                      color: config.color,
                    }}
                  >
                    {/* Completed walks */}
                    <div
                      className="absolute left-0 top-0 h-full bg-current transition-all"
                      style={{
                        opacity: 0.2,
                        width: `${completedPercentage}%`,
                      }}
                    />
                    {/* In-progress walks */}
                    <div
                      className="animate-slide-pattern absolute h-full bg-current transition-all [background:repeating-linear-gradient(45deg,transparent,transparent_10px,currentColor_10px,currentColor_20px)]"
                      style={{
                        left: `${completedPercentage}%`,
                        opacity: 0.2,
                        width: `${inProgressPercentage}%`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-6 text-base font-medium text-primary">
                      <span>{level}</span>
                      <div className="flex items-center gap-2">
                        <span>
                          {stats.completed + stats.inProgress}/{stats.total}{" "}
                          walks
                        </span>
                        {stats.inProgress > 0 && (
                          <Circle className="size-4 animate-pulse fill-green-500 text-green-500" />
                        )}
                        {stats.completed === stats.total && stats.total > 0 && (
                          <Check className="size-5 stroke-[4px] text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
