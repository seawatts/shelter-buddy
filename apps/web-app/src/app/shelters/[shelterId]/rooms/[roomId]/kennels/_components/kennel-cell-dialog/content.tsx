/* eslint-disable @typescript-eslint/no-unnecessary-condition */
"use client";

import Link from "next/link";
import { formatDistance } from "date-fns";
import { AlertTriangle, Check, ChevronRight, Info, X } from "lucide-react";

import type {
  ActivityTypeEnum,
  AnimalNoteType,
  AnimalTypeWithRelations,
  KennelType,
} from "@acme/db/schema";
import { Alert, AlertDescription, AlertTitle } from "@acme/ui/alert";
import { Icons } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";

import { AnimalImages } from "~/components/animal-images";
import { AddAnimalForm } from "./add-animal-form";
import { KennelCellDialogQuickButtons } from "./quick-buttons";

interface KennelCellDialogContentProps {
  animal?: AnimalTypeWithRelations | undefined;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  kennelId: string;
  kennels: KennelType[];
}

// Activity type to category mapping
const ACTIVITY_CATEGORIES: Record<
  Exclude<
    ActivityTypeEnum,
    | "adopted"
    | "started_foster"
    | "ended_foster"
    | "started_in_kennel"
    | "ended_in_kennel"
  >,
  {
    category:
      | "bathroom"
      | "play"
      | "training"
      | "incident"
      | "safety"
      | "health"
      | "behavior";
    severity: "info" | "low" | "medium" | "high" | "critical";
  }
> = {
  accident: { category: "bathroom", severity: "low" },
  aggressive: { category: "incident", severity: "high" },
  bite: { category: "incident", severity: "critical" },
  bloody_stool: { category: "health", severity: "high" },
  bolting_tendency: { category: "safety", severity: "high" },
  calm_in_new_places: { category: "behavior", severity: "info" },
  checks_in: { category: "behavior", severity: "info" },
  coughing: { category: "health", severity: "medium" },
  diarrhea: { category: "health", severity: "high" },
  dog_reactive: { category: "incident", severity: "medium" },
  easy_in: { category: "behavior", severity: "info" },
  easy_out: { category: "behavior", severity: "info" },
  eats_everything: { category: "safety", severity: "medium" },
  eye_discharge: { category: "health", severity: "medium" },
  focused_on_handler: { category: "behavior", severity: "info" },
  frequent_urination: { category: "health", severity: "medium" },
  good_behavior: { category: "behavior", severity: "info" },
  hot_spots: { category: "health", severity: "medium" },
  human_reactive: { category: "incident", severity: "high" },
  jumpy: { category: "safety", severity: "medium" },
  knows_123_treat: { category: "behavior", severity: "info" },
  knows_come: { category: "behavior", severity: "info" },
  knows_leave: { category: "behavior", severity: "info" },
  knows_sit: { category: "behavior", severity: "info" },
  knows_stay: { category: "behavior", severity: "info" },
  knows_wait: { category: "behavior", severity: "info" },
  leash_trained: { category: "behavior", severity: "info" },
  likes_pets: { category: "behavior", severity: "info" },
  likes_sniffing: { category: "behavior", severity: "info" },
  limping: { category: "health", severity: "high" },
  loose_stool: { category: "health", severity: "medium" },
  mouthy: { category: "safety", severity: "medium" },
  no_touches: { category: "safety", severity: "medium" },
  nose_discharge: { category: "health", severity: "medium" },
  pee: { category: "bathroom", severity: "info" },
  played_ball: { category: "play", severity: "info" },
  played_fetch: { category: "play", severity: "info" },
  played_tug: { category: "play", severity: "info" },
  plays_bow: { category: "behavior", severity: "info" },
  poop: { category: "bathroom", severity: "info" },
  pulled: { category: "incident", severity: "low" },
  pulls_hard: { category: "safety", severity: "medium" },
  resource_guarding: { category: "safety", severity: "high" },
  scratching: { category: "health", severity: "low" },
  shaking_head: { category: "health", severity: "medium" },
  shares_toys: { category: "behavior", severity: "info" },
  sneezing: { category: "health", severity: "medium" },
  takes_treats_gently: { category: "behavior", severity: "info" },
  training: { category: "training", severity: "info" },
  treats: { category: "training", severity: "info" },
  vomit: { category: "health", severity: "high" },
} as const;

export function KennelCellDialogContent({
  animal,
  roomId,
  kennelId,
  onOpenChange,
  kennels,
}: KennelCellDialogContentProps) {
  if (!animal) {
    return (
      <AddAnimalForm
        kennelId={kennelId}
        roomId={roomId}
        onOpenChange={onOpenChange}
      />
    );
  }

  const hasActiveNotes = animal.notes.some(
    (note: AnimalNoteType) => note.isActive,
  );

  // Get all critical and high severity activities
  const criticalActivities =
    animal.activities.filter((activity) => {
      const config =
        ACTIVITY_CATEGORIES[activity.type as keyof typeof ACTIVITY_CATEGORIES];
      return config?.severity === "critical" || config?.severity === "high";
    }) ?? [];

  // Get all safety related activities
  const safetyActivities =
    animal.activities.filter((activity) => {
      const config =
        ACTIVITY_CATEGORIES[activity.type as keyof typeof ACTIVITY_CATEGORIES];
      return config?.category === "safety";
    }) ?? [];

  // Get all health related activities
  const healthActivities =
    animal.activities.filter((activity) => {
      const config =
        ACTIVITY_CATEGORIES[activity.type as keyof typeof ACTIVITY_CATEGORIES];
      return config?.category === "health";
    }) ?? [];

  // Get all behavior related activities
  const behaviorActivities =
    animal.activities.filter((activity) => {
      const config =
        ACTIVITY_CATEGORIES[activity.type as keyof typeof ACTIVITY_CATEGORIES];
      return config?.category === "behavior";
    }) ?? [];

  return (
    <div className="flex flex-col gap-4">
      {(hasActiveNotes ||
        criticalActivities.length > 0 ||
        safetyActivities.length > 0 ||
        healthActivities.length > 0 ||
        behaviorActivities.length > 0) && (
        <div className="flex flex-col gap-2">
          {/* Staff Walking Requirements Alert */}
          {animal.notes.some(
            (note: AnimalNoteType) =>
              note.type === "staffRequirement" && note.isActive,
          ) && (
            <Alert>
              {/* <Icons.AlertTriangle className="size-4" /> */}
              <AlertTitle>
                <div className="flex flex-col gap-2">
                  {animal.notes
                    .filter(
                      (note) =>
                        note.type === "staffRequirement" && note.isActive,
                    )
                    .map((note, index) => (
                      <div
                        key={`staff-req-${index}`}
                        className="flex items-start gap-2"
                      >
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>{note.notes}</span>
                      </div>
                    ))}
                </div>
              </AlertTitle>
            </Alert>
          )}

          {/* Staff Alert */}
          {(animal.difficultyLevel === "Red" ||
            criticalActivities.some(
              (activity) =>
                ACTIVITY_CATEGORIES[
                  activity.type as keyof typeof ACTIVITY_CATEGORIES
                ].severity === "critical",
            )) && (
            <Alert>
              <AlertTriangle className="size-4" />
              <AlertTitle>Staff Required</AlertTitle>
              <AlertDescription>
                <div className="mt-2 flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                  <span>
                    Do not walk this animal without a staff member present.
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Aggression Alert */}
          {(animal.notes.some(
            (note: AnimalNoteType) =>
              note.type === "behavioral" &&
              note.isActive &&
              (note.notes.toLowerCase().includes("aggressive") ||
                note.notes.toLowerCase().includes("reactive")),
          ) ||
            animal.activities.some((activity) =>
              ["aggressive", "dog_reactive", "human_reactive", "bite"].includes(
                activity.type,
              ),
            )) && (
            <Alert className="border-destructive">
              <Icons.AlertTriangle
                className="size-4"
                // variant={"destructive"}
              />
              <AlertTitle>Aggression Warning</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  {/* Show notes related to aggression */}
                  {animal.notes
                    .filter(
                      (note: AnimalNoteType) =>
                        note.type === "behavioral" &&
                        note.isActive &&
                        (note.notes.toLowerCase().includes("aggressive") ||
                          note.notes.toLowerCase().includes("reactive")),
                    )
                    .map((note, index) => (
                      <div
                        key={`note-${index}`}
                        className="flex items-start gap-2"
                      >
                        <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                        <span>{note.notes}</span>
                      </div>
                    ))}
                  {/* Show aggression-related activities */}
                  {animal.activities
                    .filter((activity) =>
                      [
                        "aggressive",
                        "dog_reactive",
                        "human_reactive",
                        "bite",
                      ].includes(activity.type),
                    )
                    .map((activity, index) => (
                      <div
                        key={`activity-${index}`}
                        className="flex items-start gap-2"
                      >
                        <Icons.AlertTriangle
                          className="mt-0.5 size-3 shrink-0"
                          // variant={"destructive"}
                        />
                        <span className="capitalize">
                          {activity.type.replaceAll("_", " ")}
                          {activity.notes && `: ${activity.notes}`}
                        </span>
                      </div>
                    ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Safety Alert */}
          {safetyActivities.length > 0 && (
            <Alert
            // variant={
            //   safetyActivities.some(
            //     (activity) =>
            //       ACTIVITY_CATEGORIES[
            //         activity.type as keyof typeof ACTIVITY_CATEGORIES
            //       ].severity === "high" ||
            //       ACTIVITY_CATEGORIES[
            //         activity.type as keyof typeof ACTIVITY_CATEGORIES
            //       ].severity === "critical",
            //   )
            //     ? "destructive"
            //     : "default"
            // }
            >
              <AlertTriangle className="size-4" />
              <AlertTitle>Safety Concerns</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  {safetyActivities.map((activity, index) => {
                    const config =
                      ACTIVITY_CATEGORIES[
                        activity.type as keyof typeof ACTIVITY_CATEGORIES
                      ];
                    const isHighSeverity =
                      config.severity === "high" ||
                      config.severity === "critical";
                    return (
                      <div key={index} className="flex items-start gap-2">
                        {isHighSeverity ? (
                          <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                        ) : (
                          <Info className="mt-0.5 size-3 shrink-0" />
                        )}
                        <span className="capitalize">
                          {activity.type.replaceAll("_", " ")}
                          {activity.notes && `: ${activity.notes}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </AlertDescription>
            </Alert>
          )}
          {/* Behavior Alert */}
          {(animal.notes.some(
            (note: AnimalNoteType) =>
              note.type === "behavioral" &&
              note.isActive &&
              !note.notes.toLowerCase().includes("aggressive") &&
              !note.notes.toLowerCase().includes("reactive"),
          ) ||
            behaviorActivities.length > 0) && (
            <Alert>
              <AlertTriangle className="size-4" />
              <AlertTitle>Behavior Notes</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  {/* Show behavioral notes */}
                  {animal.notes
                    .filter(
                      (note: AnimalNoteType) =>
                        note.type === "behavioral" &&
                        note.isActive &&
                        !note.notes.toLowerCase().includes("aggressive") &&
                        !note.notes.toLowerCase().includes("reactive"),
                    )
                    .map((note, index) => (
                      <div
                        key={`note-${index}`}
                        className="flex items-start gap-2"
                      >
                        <Info className="mt-0.5 size-3 shrink-0" />
                        <span>{note.notes}</span>
                      </div>
                    ))}
                  {/* Show behavior-related activities */}
                  {behaviorActivities.map((activity, index) => (
                    <div
                      key={`activity-${index}`}
                      className="flex items-start gap-2"
                    >
                      <Info className="mt-0.5 size-3 shrink-0" />
                      <span className="capitalize">
                        {activity.type.replaceAll("_", " ")}
                        {activity.notes && `: ${activity.notes}`}
                      </span>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Medical Alert */}
      {(animal.notes.some(
        (note: AnimalNoteType) => note.type === "medical" && note.isActive,
      ) ||
        healthActivities.length > 0) && (
        <Alert
        // variant={
        //   healthActivities.some(
        //     (activity) =>
        //       ACTIVITY_CATEGORIES[
        //         activity.type as keyof typeof ACTIVITY_CATEGORIES
        //       ].severity === "high" ||
        //       ACTIVITY_CATEGORIES[
        //         activity.type as keyof typeof ACTIVITY_CATEGORIES
        //       ].severity === "critical",
        //   )
        //     ? "destructive"
        //     : "default"
        // }
        >
          <AlertTriangle className="size-4" />
          <AlertTitle>Medical Observation</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              {/* Show medical notes */}
              {animal.notes
                .filter(
                  (note: AnimalNoteType) =>
                    note.type === "medical" && note.isActive,
                )
                .map((note, index) => (
                  <div key={`note-${index}`} className="flex items-start gap-2">
                    <Info className="mt-0.5 size-3 shrink-0" />
                    <span>{note.notes}</span>
                  </div>
                ))}
              {/* Show health-related activities */}
              {healthActivities.map((activity, index) => {
                const config =
                  ACTIVITY_CATEGORIES[
                    activity.type as keyof typeof ACTIVITY_CATEGORIES
                  ];
                const isHighSeverity =
                  config.severity === "high" || config.severity === "critical";
                return (
                  <div
                    key={`activity-${index}`}
                    className="flex items-start gap-2"
                  >
                    {isHighSeverity ? (
                      <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                    ) : (
                      <Info className="mt-0.5 size-3 shrink-0" />
                    )}
                    <span className="capitalize">
                      {activity.type.replaceAll("_", " ")}
                      {activity.notes && `: ${activity.notes}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Approved Activities */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Approved Activities</h2>
        <div className="grid gap-2">
          {animal.notes.some(
            (note: AnimalNoteType) =>
              note.type === "approvedActivities" && note.isActive,
          ) ? (
            animal.notes
              .filter(
                (note: AnimalNoteType) =>
                  note.type === "approvedActivities" && note.isActive,
              )
              .map((note) => {
                const activities = note.notes.split("\n").map((activity) => {
                  const [name, status] = activity.split(": ");
                  return { name, status };
                });

                return activities.map(({ name, status }, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span
                      className={
                        status === "Approved"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {status === "Approved" ? (
                        <Check className="size-3" />
                      ) : (
                        <X className="size-3" />
                      )}
                    </span>
                    <p className="text-sm">{name}</p>
                  </div>
                ));
              })
          ) : (
            <p className="text-sm text-muted-foreground">
              No approved activities listed
            </p>
          )}
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid gap-4">
        {/* Staff Requirements */}
        {animal.notes.some(
          (note: AnimalNoteType) =>
            note.type === "behavioral" &&
            note.isActive &&
            (note.notes.includes("Staff required for leash up") ||
              note.notes.includes("Staff required for return")),
        ) && (
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Staff Requirements</h2>
            <div className="grid gap-2">
              {animal.notes
                .filter(
                  (note: AnimalNoteType) =>
                    note.type === "behavioral" &&
                    note.isActive &&
                    (note.notes.includes("Staff required for leash up") ||
                      note.notes.includes("Staff required for return")),
                )
                .map((note, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <AlertTriangle className="text-warning size-3" />
                    <p className="text-sm">{note.notes}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

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
          </div>
        </div>

        {/* Walking History */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Walking History</h2>
          <div className="space-y-2">
            {animal.walks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No walks recorded</p>
            ) : (
              animal.walks.map((walk, index) => (
                <Link
                  key={index}
                  href={
                    walk.status === "in_progress"
                      ? `/shelters/${walk.shelterId}/animals/${walk.animalId}/walks/${walk.id}/in-progress`
                      : `/shelters/${walk.shelterId}/animals/${walk.animalId}/walks/${walk.id}`
                  }
                  className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 hover:bg-accent/50"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      {formatDistance(
                        new Date(walk.endedAt ?? walk.startedAt),
                        new Date(),
                        {
                          addSuffix: true,
                        },
                      )}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        walk.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800",
                      )}
                    >
                      {walk.status === "completed"
                        ? "Completed"
                        : "In Progress"}
                    </span>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <KennelCellDialogQuickButtons
        animal={animal}
        onOpenChange={onOpenChange}
        kennels={kennels}
      />

      <AnimalImages
        name={animal.name}
        roomId={roomId}
        kennelId={kennelId}
        media={animal.media}
        animalId={animal.id}
        shelterId={animal.shelterId}
      />
    </div>
  );
}
