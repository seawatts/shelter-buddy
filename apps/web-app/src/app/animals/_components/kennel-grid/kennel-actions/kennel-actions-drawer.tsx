"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Timer } from "lucide-react";

import { Badge } from "@acme/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@acme/ui/drawer";
import { cn } from "@acme/ui/lib/utils";

import type { Animal, Kennel } from "../../../types";
import { DIFFICULTY_CONFIG } from "../../../difficulty-config";
import { AnimalImages } from "../animal-images";
import { formatDuration, getLastCompletedWalk } from "../utils";
import { WalkStatus } from "../walk-status";
import { KennelActionsContent } from "./kennel-actions-content";

interface KennelActionsDrawerProps {
  animal: Animal | undefined;
  kennel: Kennel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapPoints: (string | number)[];
  activeSnapPoint: string | number | null;
  setActiveSnapPoint: (snapPoint: string | number | null) => void;
}

export function KennelActionsDrawer({
  animal,
  kennel,
  open,
  onOpenChange,
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
}: KennelActionsDrawerProps) {
  const difficultyConfig = animal
    ? DIFFICULTY_CONFIG[animal.difficultyLevel]
    : null;

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
    >
      <DrawerContent
        className={cn(
          "overflow-y-auto",
          animal?.difficultyLevel === "Yellow" && "border-t-yellow border-t-4",
          animal?.difficultyLevel === "Purple" && "border-t-purple border-t-4",
          animal?.difficultyLevel === "Red" && "border-t-red border-t-4",
        )}
      >
        <div className="mx-auto w-full max-w-sm">
          {animal && (
            <AnimalImages name={animal.name} media={animal.media} isMobile />
          )}
          <DrawerHeader>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <DrawerTitle>
                    <Link href={`/animals/${animal?.id}`}>
                      <span className="flex items-center gap-2 underline underline-offset-4">
                        {kennel.id} {animal && `${animal.name}`}
                        {animal && <ArrowRight className="size-4" />}
                      </span>
                    </Link>
                  </DrawerTitle>
                  {animal && difficultyConfig && (
                    <div
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: difficultyConfig.color,
                        color: "white",
                      }}
                    >
                      {difficultyConfig.label}
                    </div>
                  )}
                  {animal?.tags && animal.tags.length > 0 && (
                    <div className="flex gap-1">
                      {animal.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className={cn(
                            "rounded-full text-xs",
                            tag === "first" && "bg-gray-500",
                            tag === "last" && "bg-gray-400",
                          )}
                        >
                          {tag}
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
