"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Timer } from "lucide-react";

import type { AnimalType, KennelType } from "@acme/db/schema";
import { Badge } from "@acme/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@acme/ui/drawer";
import { cn } from "@acme/ui/lib/utils";

import { formatDuration, getLastCompletedWalk } from "../utils";
import { WalkStatus } from "../walk-status";
import { KennelActionsContent } from "./kennel-actions-content";

interface KennelActionsDrawerProps {
  animal?: AnimalType;
  kennel: KennelType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KennelActionsDrawer({
  animal,
  kennel,
  open,
  onOpenChange,
}: KennelActionsDrawerProps) {
  const snapPoints = useMemo(() => [0.5, 1], []);
  const [activeSnapPoint, setActiveSnapPoint] = useState<number | null>(
    snapPoints[0] ?? null,
  );

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={(point: string | number | null) =>
        setActiveSnapPoint(typeof point === "number" ? point : null)
      }
    >
      <DrawerContent
        className={cn({
          "border-t-4 border-t-purple": animal?.difficultyLevel === "Purple",
          "border-t-4 border-t-red": animal?.difficultyLevel === "Red",
          "border-t-4 border-t-yellow": animal?.difficultyLevel === "Yellow",
        })}
      >
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <DrawerTitle>
                    <Link href={`/animals/${animal?.id}`}>
                      <span className="flex items-center gap-2 underline underline-offset-4">
                        {kennel.name} {animal && `${animal.name}`}
                        {animal && <ArrowRight className="size-4" />}
                      </span>
                    </Link>
                  </DrawerTitle>
                  {animal?.tags && animal.tags.length > 0 && (
                    <div className="flex gap-1">
                      {animal.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          className={cn("rounded-full text-xs", {
                            "bg-gray-400 dark:bg-gray-500": tag.tag === "last",
                            "bg-gray-500 dark:bg-gray-400": tag.tag === "first",
                          })}
                        >
                          {tag.tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {animal && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const lastWalk = getLastCompletedWalk(animal);
                        if (!lastWalk)
                          return (
                            <span className="text-xs text-muted-foreground">
                              No walks completed
                            </span>
                          );

                        const lastWalkDate = new Date(lastWalk.date);
                        return (
                          <span className="flex flex-col gap-1 text-xs text-muted-foreground">
                            <span>
                              Last walk{" "}
                              {formatDistanceToNow(lastWalkDate, {
                                addSuffix: true,
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer className="size-3" />
                              {formatDuration(lastWalk.duration)}
                            </span>
                          </span>
                        );
                      })()}
                    </p>
                  </div>
                )}
              </div>
              {animal && <WalkStatus animal={animal} />}
            </div>
          </DrawerHeader>

          <div className="p-4">
            <KennelActionsContent animal={animal} onOpenChange={onOpenChange} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
