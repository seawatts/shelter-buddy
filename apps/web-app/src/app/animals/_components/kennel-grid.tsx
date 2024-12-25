"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow, intervalToDuration } from "date-fns";
import { Camera, Check, Circle, ImageIcon, Timer, X } from "lucide-react";
import { useQueryState } from "nuqs";

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
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@acme/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { useIsMobile } from "@acme/ui/hooks/use-mobile";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { cn } from "@acme/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

import type { Animal, DifficultyLevel, Kennel } from "../types";

interface KennelGridProps {
  animals: Animal[];
  kennels: Kennel[];
}

interface KennelActionsProps {
  animal: Animal | undefined;
  kennel: Kennel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddAnimalForm() {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const headshotPhotoInputRef = useRef<HTMLInputElement>(null);
  const headshotLibraryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    breed: "",
    difficultyLevel: "" as DifficultyLevel,
    headshot: null as string | null,
    name: "",
  });

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "import" | "headshot",
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "headshot") {
          setFormData((previous) => ({
            ...previous,
            headshot: reader.result as string,
          }));
        }
        // Handle import type if needed
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2">
                <Camera className="size-4" />
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[200px]">
              <DropdownMenuItem
                onClick={() => photoInputRef.current?.click()}
                className="gap-2"
              >
                <Camera className="size-4" />
                Take Photo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => libraryInputRef.current?.click()}
                className="gap-2"
              >
                <ImageIcon className="size-4" />
                Choose from Library
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2">
                <Camera className="size-4" />
                Headshot
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[200px]">
              <DropdownMenuItem
                onClick={() => headshotPhotoInputRef.current?.click()}
                className="gap-2"
              >
                <Camera className="size-4" />
                Take Photo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => headshotLibraryInputRef.current?.click()}
                className="gap-2"
              >
                <ImageIcon className="size-4" />
                Choose from Library
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {formData.headshot && (
          <div className="relative mx-auto">
            <div className="relative size-32">
              <Image
                src={formData.headshot}
                alt="Headshot preview"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute -right-2 -top-2 size-6 rounded-full p-1"
              onClick={() =>
                setFormData((previous) => ({ ...previous, headshot: null }))
              }
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={photoInputRef}
          onChange={(event) => handleFileChange(event, "import")}
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={libraryInputRef}
          onChange={(event) => handleFileChange(event, "import")}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={headshotPhotoInputRef}
          onChange={(event) => handleFileChange(event, "headshot")}
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={headshotLibraryInputRef}
          onChange={(event) => handleFileChange(event, "headshot")}
        />

        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(event) =>
              setFormData((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="breed">Breed</Label>
          <Input
            id="breed"
            value={formData.breed}
            onChange={(event) =>
              setFormData((previous) => ({
                ...previous,
                breed: event.target.value,
              }))
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select
            value={formData.difficultyLevel}
            onValueChange={(value) =>
              setFormData((previous) => ({
                ...previous,
                difficultyLevel: value as DifficultyLevel,
              }))
            }
          >
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yellow">Yellow</SelectItem>
              <SelectItem value="Purple">Purple</SelectItem>
              <SelectItem value="Red">Red</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="mt-2"
          disabled={
            !formData.name || !formData.breed || !formData.difficultyLevel
          }
          onClick={() => {
            // TODO: Handle form submission
            console.log("Form data:", formData);
          }}
        >
          Add Animal
        </Button>
      </div>
    </div>
  );
}

function KennelActions({
  animal,
  kennel,
  open,
  onOpenChange,
}: KennelActionsProps) {
  const isMobile = useIsMobile();

  const content = animal ? (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Button variant="outline">Reassign</Button>
        <Button variant="outline" asChild>
          <Link href={`/animals/${animal.id}`}>More Details</Link>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              // TODO: Handle adopted action
              onOpenChange(false);
            }}
          >
            Mark Adopted
          </Button>
          {!hasWalkInProgress(animal) && (
            <Button
              variant={animal.isOutOfKennel ? "default" : "outline"}
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
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start gap-2">
                  <DrawerTitle>
                    {kennel.id} {animal && `- ${animal.name}`}
                  </DrawerTitle>
                  <DrawerDescription>
                    <div className="flex items-center gap-2">
                      {animal?.difficultyLevel && (
                        <Badge
                          className={cn(
                            "rounded-full",
                            animal.difficultyLevel === "Yellow" &&
                              "bg-[hsl(var(--chart-3))]",
                            animal.difficultyLevel === "Purple" &&
                              "bg-[hsl(var(--chart-4))]",
                            animal.difficultyLevel === "Red" &&
                              "bg-[hsl(var(--chart-5))]",
                          )}
                        >
                          {animal.difficultyLevel}
                        </Badge>
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
                  </DrawerDescription>
                </div>
                {animal && walkStatusDisplay(animal)}
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
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {kennel.id} {animal && `- ${animal.name}`}
            </DialogTitle>
            {animal && walkStatusDisplay(animal)}
          </div>
        </DialogHeader>
        <div className="mt-4">{content}</div>
      </DialogContent>
    </Dialog>
  );
}

function matchesFilters(
  animal: Animal,
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
      !selectedTags.some((tag) => animal.tags?.includes(tag))
    ) {
      return false;
    }
  }

  return true;
}

function hasBeenWalkedToday(animal: Animal) {
  const today = new Date().toISOString().split("T")[0];
  return Object.values(animal.walks).some((walk) => {
    if (!walk.completed) return false;
    const walkDate = new Date(walk.time).toISOString().split("T")[0];
    return walkDate === today;
  });
}

function hasWalkInProgress(animal: Animal) {
  const today = new Date().toISOString().split("T")[0];
  return Object.values(animal.walks).some((walk) => {
    if (walk.completed) return false;
    if (!walk.activities) return false;
    const walkDate = new Date(walk.time).toISOString().split("T")[0];
    return walkDate === today;
  });
}

function sortKennels(kennels: Kennel[]): Kennel[] {
  return [...kennels].sort((a, b) => {
    const aNumber = Number.parseInt(a.id.replaceAll(/\D/g, ""));
    const bNumber = Number.parseInt(b.id.replaceAll(/\D/g, ""));
    return aNumber - bNumber;
  });
}

function arrangeKennels(kennels: Kennel[]): [Kennel[], Kennel[]] {
  const midpoint = Math.ceil(kennels.length / 2);

  // First column: bottom to top
  const firstColumn = kennels.slice(0, midpoint).reverse();

  // Second column: top to bottom
  const secondColumn = kennels.slice(midpoint);

  return [firstColumn, secondColumn];
}

function getActiveWalkStartTime(animal: Animal): Date | null {
  const today = new Date().toISOString().split("T")[0];
  const activeWalk = Object.values(animal.walks).find((walk) => {
    if (walk.completed || !walk.activities) return false;
    const walkDate = new Date(walk.time).toISOString().split("T")[0];
    return walkDate === today;
  });

  return activeWalk ? new Date(activeWalk.time) : null;
}

function formatElapsedTime(startTime: Date): string {
  const duration = intervalToDuration({
    end: new Date(),
    start: startTime,
  });
  return `${duration.minutes ?? 0}:${(duration.seconds ?? 0).toString().padStart(2, "0")}`;
}

function getCompletedWalkInfo(
  animal: Animal,
): { completedTime: string; duration: number } | null {
  const today = new Date().toISOString().split("T")[0];
  const completedWalk = Object.values(animal.walks).find((walk) => {
    if (!walk.completed) return false;
    const walkDate = new Date(walk.time).toISOString().split("T")[0];
    return walkDate === today;
  });

  if (!completedWalk?.duration) return null;

  return {
    completedTime: completedWalk.time,
    duration: completedWalk.duration * 60, // Convert minutes to seconds
  };
}

function formatDuration(durationInSeconds: number): string {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const walkStatusDisplay = (animal: Animal) => (
  <div className="flex items-center gap-1.5">
    {hasWalkInProgress(animal) && (
      <div className="flex flex-col items-end gap-2">
        <Button variant="destructive" asChild>
          <Link href={`/animals/${animal.id}/walk`}>Stop Walk</Link>
        </Button>
        <div className="flex items-center gap-1">
          {(() => {
            const startTime = getActiveWalkStartTime(animal);
            if (startTime) {
              return (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="size-3" />
                  {formatElapsedTime(startTime)}
                </span>
              );
            }
            return null;
          })()}
          <Circle className="size-4 animate-pulse fill-current text-green-500" />
        </div>
      </div>
    )}
    {!hasWalkInProgress(animal) && hasBeenWalkedToday(animal) && (
      <>
        {(() => {
          const walkInfo = getCompletedWalkInfo(animal);
          if (walkInfo) {
            return (
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(walkInfo.completedTime), {
                    addSuffix: true,
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="size-3" />
                  {formatDuration(walkInfo.duration)}
                </span>
              </span>
            );
          }
          return null;
        })()}
        <Check className="size-5 stroke-[4px] text-green-500" />
      </>
    )}
    {!hasWalkInProgress(animal) &&
      !hasBeenWalkedToday(animal) &&
      !animal.isOutOfKennel && (
        <Button variant="default" asChild>
          <Link href={`/animals/${animal.id}/walk`}>Start Walk</Link>
        </Button>
      )}
  </div>
);

export function KennelGrid(props: KennelGridProps) {
  const [selectedKennel, setSelectedKennel] = useState<Kennel | null>(null);
  const [difficultyFilter] = useQueryState("difficultyFilter");
  const [tagFilter] = useQueryState("tagFilter");

  // Sort kennels once and memoize the result
  const sortedKennels = useMemo(
    () => sortKennels(props.kennels),
    [props.kennels],
  );
  const [leftColumn, rightColumn] = useMemo(
    () => arrangeKennels(sortedKennels),
    [sortedKennels],
  );

  // Effect to handle scrolling when filter changes
  useEffect(() => {
    if (!difficultyFilter) return;

    const selectedFilters = difficultyFilter.split(",");
    if (selectedFilters.length === 0) return;

    const today = new Date().toISOString().split("T")[0];

    // Find the first visible kennel that matches the filter and hasn't been walked
    const firstMatchingKennel = sortedKennels.find((kennel) => {
      const animal = props.animals.find((a) => a.kennelNumber === kennel.id);
      if (!animal || !selectedFilters.includes(animal.difficultyLevel))
        return false;

      // Check if the animal has been walked today or has a walk in progress
      const walks = Object.values(animal.walks).filter((walk) => {
        const walkDate = new Date(walk.time).toISOString().split("T")[0];
        return walkDate === today;
      });

      const hasBeenWalked = walks.some((walk) => walk.completed);
      const hasWalkInProgress = walks.some(
        (walk) => !walk.completed && walk.activities,
      );

      // Only match if the animal hasn't been walked and doesn't have a walk in progress
      return !hasBeenWalked && !hasWalkInProgress;
    });

    if (firstMatchingKennel) {
      const kennelElement = document.querySelector(
        `[data-kennel-id="${firstMatchingKennel.id}"]`,
      );
      if (kennelElement) {
        kennelElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [difficultyFilter, sortedKennels, props.animals]);

  const renderKennel = (kennel: Kennel) => {
    const animal = props.animals.find((a) => a.kennelNumber === kennel.id);
    const isFiltered = animal
      ? !matchesFilters(animal, difficultyFilter, tagFilter)
      : false;
    const isWalked = animal ? hasBeenWalkedToday(animal) : false;
    const hasActiveWalk = animal ? hasWalkInProgress(animal) : false;
    const isAvailable = kennel.status === "available";
    const isUnderMaintenance = kennel.status === "maintenance";
    const tags = animal?.tags ?? [];

    const shouldReduceOpacity = isFiltered || (isWalked && !hasActiveWalk);

    const kennelContent = (
      <div
        data-kennel-id={kennel.id}
        className={cn(
          "relative flex h-14 items-center justify-between rounded-full border-4 border-[hsl(var(--border-color)/var(--border-opacity))] p-3 transition-opacity hover:opacity-80",
          {
            "[--border-color:var(--chart-3)]":
              animal?.difficultyLevel === "Yellow",
            "[--border-color:var(--chart-4)]":
              animal?.difficultyLevel === "Purple",
            "[--border-color:var(--chart-5)]":
              animal?.difficultyLevel === "Red",
            "[--border-opacity:0.25]": shouldReduceOpacity,
            "[--border-opacity:1]": !shouldReduceOpacity,
            "[background-color:hsl(var(--chart-3)/0.2)]":
              animal?.difficultyLevel === "Yellow" &&
              !isWalked &&
              !hasActiveWalk &&
              !isFiltered &&
              !animal.isOutOfKennel,
            "[background-color:hsl(var(--chart-4)/0.2)]":
              animal?.difficultyLevel === "Purple" &&
              !isWalked &&
              !hasActiveWalk &&
              !isFiltered &&
              !animal.isOutOfKennel,
            "[background-color:hsl(var(--chart-5)/0.2)]":
              animal?.difficultyLevel === "Red" &&
              !isWalked &&
              !hasActiveWalk &&
              !isFiltered &&
              !animal.isOutOfKennel,
            "animate-slide-pattern [background:repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--chart-3)/0.2)_10px,hsl(var(--chart-3)/0.2)_20px)]":
              animal?.difficultyLevel === "Yellow" && hasActiveWalk,
            "animate-slide-pattern [background:repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--chart-4)/0.2)_10px,hsl(var(--chart-4)/0.2)_20px)]":
              animal?.difficultyLevel === "Purple" && hasActiveWalk,
            "animate-slide-pattern [background:repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--chart-5)/0.2)_10px,hsl(var(--chart-5)/0.2)_20px)]":
              animal?.difficultyLevel === "Red" && hasActiveWalk,
            "bg-card": !animal?.isOutOfKennel || hasActiveWalk,
            "border-dashed": isAvailable || animal?.isOutOfKennel,
            "border-muted": isAvailable,
            "cursor-not-allowed": !animal,
            "cursor-pointer": animal,
            "opacity-50": isUnderMaintenance || shouldReduceOpacity,
          },
        )}
        onClick={() => setSelectedKennel(kennel)}
      >
        <div className="min-w-0 truncate">
          <div className="text-sm font-medium">
            {kennel.id}
            {animal && (
              <span className="ml-2 text-muted-foreground">{animal.name}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isWalked && !hasActiveWalk && tags.length > 0 && (
            <div className="flex gap-1">
              {tags.map((tag) => (
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
          {(isWalked || hasActiveWalk) && (
            <div className="flex items-center gap-1.5">
              {hasActiveWalk ? (
                <>
                  {(() => {
                    const startTime = animal
                      ? getActiveWalkStartTime(animal)
                      : null;
                    if (startTime) {
                      return (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Timer className="size-3" />
                          {formatElapsedTime(startTime)}
                        </span>
                      );
                    }
                    return null;
                  })()}
                  <Circle className="size-4 animate-pulse fill-current text-green-500" />
                </>
              ) : (
                <Check className="size-5 stroke-[4px] text-green-500" />
              )}
            </div>
          )}
        </div>
      </div>
    );

    return <div key={kennel.id}>{kennelContent}</div>;
  };

  return (
    <>
      <div className="flex w-full justify-center">
        <div className="grid w-full grid-cols-2 justify-center gap-3 sm:min-w-[640px] sm:max-w-[800px] sm:gap-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {leftColumn.map((kennel) => (
              <Fragment key={kennel.id}>{renderKennel(kennel)}</Fragment>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            {rightColumn.map((kennel) => (
              <Fragment key={kennel.id}>{renderKennel(kennel)}</Fragment>
            ))}
          </div>
        </div>
      </div>

      {selectedKennel && (
        <KennelActions
          kennel={selectedKennel}
          animal={props.animals.find(
            (a) => a.kennelNumber === selectedKennel.id,
          )}
          open={Boolean(selectedKennel)}
          onOpenChange={(open) => {
            if (!open) setSelectedKennel(null);
          }}
        />
      )}
    </>
  );
}
