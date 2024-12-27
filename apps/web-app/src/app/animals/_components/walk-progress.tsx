"use client";

import { isToday } from "date-fns";
import { Check, Circle } from "lucide-react";
import { useQueryState } from "nuqs";

import type { AnimalType } from "@acme/db/schema";
import { cn } from "@acme/ui/lib/utils";

import type { DifficultyLevel } from "../difficulty-config";
import { DIFFICULTY_CONFIG } from "../difficulty-config";

interface WalkProgressProps {
  animals: AnimalType[];
}

export function WalkProgress({ animals }: WalkProgressProps) {
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
  for (const animal of animals) {
    dogsByDifficulty[animal.difficultyLevel]++;
  }

  // Initialize stats with the total number of walks needed (3 per dog)
  for (const [difficulty] of Object.entries(dogsByDifficulty)) {
    difficultyStats[difficulty as DifficultyLevel] = {
      completed: 0,
      inProgress: 0,
      total: dogsByDifficulty[difficulty as DifficultyLevel],
    };
  }

  // Count completed and in-progress walks
  for (const animal of animals) {
    const level = animal.difficultyLevel;
    const todayWalks = animal.walks.filter((walk) => isToday(walk.startedAt));

    const completedCount = todayWalks.filter(
      (walk) => walk.status === "completed",
    ).length;
    const inProgressCount = todayWalks.filter(
      (walk) => walk.status === "in_progress",
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
      <div className="grid w-full grid-cols-2 gap-4 sm:min-w-[640px] sm:max-w-[800px] sm:grid-cols-1 md:grid-cols-2">
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
                      "relative h-10 w-full overflow-hidden rounded-xl border-4 transition-all md:h-12",
                      {
                        "border-purple": level === "Purple",
                        "border-red": level === "Red",
                        "border-yellow": level === "Yellow",
                      },
                      selectedFilters.includes(level) && "ring-2 ring-offset-2",
                      {
                        "ring-purple":
                          level === "Purple" && selectedFilters.includes(level),
                        "ring-yellow":
                          level === "Yellow" && selectedFilters.includes(level),
                      },
                      // selectedFilters.includes(level) &&
                      // "ring-[hsl(var(--ring-color))]",
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
                    <div className="absolute inset-0 flex items-center justify-center px-6 text-base">
                      <div className="flex items-center justify-center gap-6 text-sm font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Check
                            className={cn(
                              "size-5 stroke-[3px]",
                              stats.completed > 0
                                ? "text-green-500"
                                : "text-muted-foreground",
                            )}
                          />
                          <span className="text-primary">
                            {stats.completed}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Circle className="size-5 animate-pulse fill-green-500 text-green-500" />
                          <span className="text-primary">
                            {stats.inProgress}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Circle className="size-5 text-muted-foreground" />
                          <span className="text-primary">
                            {stats.total - (stats.completed + stats.inProgress)}
                          </span>
                        </div>
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
