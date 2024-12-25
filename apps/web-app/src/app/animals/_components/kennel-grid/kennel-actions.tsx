"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { AlertTriangle, ArrowRight, Info, Timer } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@acme/ui/alert";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@acme/ui/drawer";
import { useIsMobile } from "@acme/ui/hooks/use-mobile";
import { cn } from "@acme/ui/lib/utils";

import type { Animal, Kennel } from "../../types";
import { AddAnimalForm } from "./add-animal-form";
import { AnimalImages } from "./animal-images";
import {
  formatDuration,
  getLastCompletedWalk,
  hasWalkInProgress,
} from "./utils";
import { WalkStatus } from "./walk-status";

interface KennelActionsProps {
  animal: Animal | undefined;
  kennel: Kennel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KennelActions({
  animal,
  kennel,
  open,
  onOpenChange,
}: KennelActionsProps) {
  const isMobile = useIsMobile();

  const content = animal ? (
    <div className="flex flex-col gap-4">
      {((animal.medicalNotes ?? "") ||
        (animal.behavioralNotes ?? "") ||
        (animal.generalNotes ?? "") ||
        animal.difficultyLevel === "Purple" ||
        animal.difficultyLevel === "Red" ||
        animal.isFido) && (
        <Alert>
          <AlertTriangle className="size-4" />
          <AlertTitle>Important Information</AlertTitle>
          <AlertDescription>
            <div className="mt-4 flex flex-col gap-2">
              {animal.medicalNotes && (
                <div className="flex items-center gap-2">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  <span>Medical: {animal.medicalNotes}</span>
                </div>
              )}
              {animal.behavioralNotes && (
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  <span>Behavioral: {animal.behavioralNotes}</span>
                </div>
              )}
              {animal.generalNotes && (
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  <span>{animal.generalNotes}</span>
                </div>
              )}
              {(animal.difficultyLevel === "Purple" ||
                animal.difficultyLevel === "Red") && (
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  <span className="font-medium">
                    {animal.difficultyLevel === "Purple"
                      ? "Requires experienced handler"
                      : "Requires very experienced handler"}
                  </span>
                </div>
              )}
              {animal.isFido && (
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  <span className="font-medium">
                    FIDO certification required for walks
                  </span>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              // TODO: Handle adopted action
              onOpenChange(false);
            }}
          >
            Reassign Kennel
          </Button>

          {!hasWalkInProgress(animal) && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // TODO: Handle out of kennel action
                onOpenChange(false);
              }}
            >
              {animal.isOutOfKennel ? "Mark In Kennel" : "Mark Out of Kennel"}
            </Button>
          )}
        </div>
      </div>
    </div>
  ) : (
    <AddAnimalForm />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className={cn(
            animal?.difficultyLevel === "Yellow" &&
              "border-t-4 border-t-[hsl(var(--chart-3))]",
            animal?.difficultyLevel === "Purple" &&
              "border-t-4 border-t-[hsl(var(--chart-4))]",
            animal?.difficultyLevel === "Red" &&
              "border-t-4 border-t-[hsl(var(--chart-5))]",
          )}
        >
          <div className="mx-auto w-full max-w-sm">
            <AnimalImages
              name={animal?.name}
              images={animal?.images}
              isMobile
            />
            <DrawerHeader>
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <DrawerTitle>
                      <Link href={`/animals/${animal?.id}`}>
                        <span className="flex items-center gap-2">
                          {kennel.id} {animal && `${animal.name}`}
                          {animal && <ArrowRight className="size-4" />}
                        </span>
                      </Link>
                    </DrawerTitle>
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

                          return (
                            <span className="flex flex-col gap-1 text-xs text-muted-foreground">
                              <span>
                                Last walk{" "}
                                {formatDistanceToNow(
                                  new Date(lastWalk.date ?? ""),
                                  {
                                    addSuffix: true,
                                  },
                                )}
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
            <div className="p-4">{content}</div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          animal?.difficultyLevel === "Yellow" &&
            "border-t-4 border-t-[hsl(var(--chart-3))]",
          animal?.difficultyLevel === "Purple" &&
            "border-t-4 border-t-[hsl(var(--chart-4))]",
          animal?.difficultyLevel === "Red" &&
            "border-t-4 border-t-[hsl(var(--chart-5))]",
        )}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <DialogTitle>
                  {kennel.id} {animal && `- ${animal.name}`}
                </DialogTitle>
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
                      if (!lastWalk?.date) return "No walks completed";
                      return `Last walk: ${format(
                        new Date(lastWalk.date),
                        "h:mm a",
                      )} (${lastWalk.duration} min)`;
                    })()}
                  </p>
                  <WalkStatus animal={animal} />
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <AnimalImages name={animal?.name} images={animal?.images} />
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
