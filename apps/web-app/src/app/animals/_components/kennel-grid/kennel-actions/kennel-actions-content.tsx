"use client";

import { AlertTriangle, Check, Info, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@acme/ui/alert";
import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/lib/utils";

import type { Animal } from "../../../types";
import { AddAnimalForm } from "../add-animal-form";
import { AnimalImages } from "../animal-images";
import { hasWalkInProgress } from "../utils";

interface KennelActionsContentProps {
  animal: Animal | undefined;
  onOpenChange: (open: boolean) => void;
}

export function KennelActionsContent({
  animal,
  onOpenChange,
}: KennelActionsContentProps) {
  if (!animal) {
    return <AddAnimalForm />;
  }

  const hasActiveNotes =
    (animal.medicalNotes?.some((note) => note.isActive) ?? false) ||
    (animal.behavioralNotes?.some((note) => note.isActive) ?? false) ||
    (animal.generalNotes?.some((note) => note.isActive) ?? false);

  return (
    <div className="flex flex-col gap-4">
      {(hasActiveNotes ||
        animal.difficultyLevel === "Purple" ||
        animal.difficultyLevel === "Red" ||
        animal.isFido) && (
        <Alert>
          <AlertTriangle className="size-4" />
          <AlertTitle>Important Information</AlertTitle>
          <AlertDescription>
            <div className="mt-4 flex flex-col gap-2">
              {animal.medicalNotes?.some((note) => note.isActive) && (
                <div className="flex items-center gap-2">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  <span>
                    Medical:{" "}
                    {animal.medicalNotes
                      .filter((note) => note.isActive)
                      .map((note) => note.notes)
                      .join(", ")}
                  </span>
                </div>
              )}
              {animal.behavioralNotes?.some((note) => note.isActive) && (
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  <span>
                    Behavioral:{" "}
                    {animal.behavioralNotes
                      .filter((note) => note.isActive)
                      .map((note) => note.notes)
                      .join(", ")}
                  </span>
                </div>
              )}
              {animal.generalNotes?.some((note) => note.isActive) && (
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  <span>
                    {animal.generalNotes
                      .filter((note) => note.isActive)
                      .map((note) => note.notes)
                      .join(", ")}
                  </span>
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

      {/* Quick Actions */}
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            // TODO: Handle add notes action
            onOpenChange(false);
          }}
        >
          Add Notes
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
            Reassign Kennel
          </Button>

          {!hasWalkInProgress(animal) && !animal.isOutOfKennel && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // TODO: Handle out of kennel action
                onOpenChange(false);
              }}
            >
              Mark Out of Kennel
            </Button>
          )}
        </div>
      </div>
      <AnimalImages name={animal.name} media={animal.media} isMobile />
      {/* Additional Details */}
      <div className="grid gap-4">
        {/* Basic Info */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Basic Information</h2>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Breed</span>
              <span>{animal.breed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Weight</span>
              <span>{animal.weight} lbs</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Age</span>
              <span>{animal.age} years</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span>
                {animal.isOutOfKennel ? "Out of Kennel" : "In Kennel"}
              </span>
            </div>
          </div>
        </div>

        {/* Approved Activities */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Approved Activities</h2>
          <div className="grid gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={animal.isFido ? "text-green-600" : "text-red-600"}
              >
                {animal.isFido ? (
                  <Check className="size-3" />
                ) : (
                  <X className="size-3" />
                )}
              </span>
              <p className="text-sm">FIDO Certified</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {animal.approvedActivities &&
              animal.approvedActivities.length > 0 ? (
                animal.approvedActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <Check className="size-3 text-green-600" />
                    <p className="text-sm">{activity}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No approved activities listed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Walking History */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Walking History</h2>
          <div className="space-y-2">
            {animal.walks?.map((walk, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
              >
                <span className="text-sm">
                  {new Date(walk.startedAt).toLocaleDateString()}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    walk.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800",
                  )}
                >
                  {walk.status === "completed" ? "Completed" : "In Progress"}
                </span>
              </div>
            )) ?? (
              <p className="text-sm text-muted-foreground">
                No walk history available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
