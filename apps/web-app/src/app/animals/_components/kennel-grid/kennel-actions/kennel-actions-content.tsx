"use client";

import { AlertTriangle, Check, Info, X } from "lucide-react";

import type { AnimalNoteType, AnimalTypeWithRelations } from "@acme/db/schema";
import { Alert, AlertDescription, AlertTitle } from "@acme/ui/alert";
import { cn } from "@acme/ui/lib/utils";

import { AnimalImages } from "../animal-images";
import { AddAnimalForm } from "./add-animal-form";
import { KennelActionsForm } from "./kennel-actions-form";

interface KennelActionsContentProps {
  animal?: AnimalTypeWithRelations | undefined;
  onOpenChange: (open: boolean) => void;
  kennelId: string;
}

export function KennelActionsContent({
  animal,
  kennelId,
  onOpenChange,
}: KennelActionsContentProps) {
  if (!animal) {
    return (
      <AddAnimalForm
        kennelId={kennelId}
        onSubmit={() => {
          onOpenChange(false);
        }}
      />
    );
  }

  const hasActiveNotes = animal.notes.some(
    (note: AnimalNoteType) => note.isActive,
  );

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
              {animal.notes.some(
                (note: AnimalNoteType) =>
                  note.type === "medical" && note.isActive,
              ) && (
                <div className="flex items-center gap-2">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  <span>
                    Medical:{" "}
                    {animal.notes
                      .filter(
                        (note: AnimalNoteType) =>
                          note.type === "medical" && note.isActive,
                      )
                      .map((note) => note.notes)
                      .join(", ")}
                  </span>
                </div>
              )}
              {animal.notes.some(
                (note: AnimalNoteType) =>
                  note.type === "behavioral" && note.isActive,
              ) && (
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  <span>
                    Behavioral:{" "}
                    {animal.notes
                      .filter(
                        (note: AnimalNoteType) =>
                          note.type === "behavioral" && note.isActive,
                      )
                      .map((note) => note.notes)
                      .join(", ")}
                  </span>
                </div>
              )}
              {animal.notes.some(
                (note: AnimalNoteType) =>
                  note.type === "general" && note.isActive,
              ) && (
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  <span>
                    {animal.notes
                      .filter(
                        (note: AnimalNoteType) =>
                          note.type === "general" && note.isActive,
                      )
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
      <KennelActionsForm animal={animal} onOpenChange={onOpenChange} />

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
              <span>{animal.birthDate?.toLocaleString()} years</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span>
                {animal.kennelOccupants[0]?.isOutOfKennel
                  ? "Out of Kennel"
                  : "In Kennel"}
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
              {animal.notes.some(
                (note: AnimalNoteType) =>
                  note.type === "approvedActivities" && note.isActive,
              ) ? (
                animal.notes
                  .filter(
                    (note: AnimalNoteType) =>
                      note.type === "approvedActivities" && note.isActive,
                  )
                  .map((note, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <Check className="size-3 text-green-600" />
                      <p className="text-sm">{note.notes}</p>
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
            {animal.walks.map((walk, index) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
