"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Check, Timer, X } from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { cn } from "@acme/ui/lib/utils";

import type { Animal } from "../../types";
import {
  formatDuration,
  getLastCompletedWalk,
} from "../../_components/kennel-grid/utils";
import { DIFFICULTY_CONFIG } from "../../difficulty-config";
import { QuickReferenceDialog } from "./quick-reference-dialog";

interface AnimalDetailsProps {
  animal: Animal;
}

export function AnimalDetails({ animal }: AnimalDetailsProps) {
  const router = useRouter();
  const difficultyConfig = DIFFICULTY_CONFIG[animal.difficultyLevel];
  const lastWalk: { date: Date; duration: number } | undefined =
    getLastCompletedWalk(animal);

  const handleStartWalk = () => {
    router.push(`/animals/${animal.id}/walk`);
  };

  return (
    <div className="grid gap-4">
      {/* Header Section */}
      <div className="flex flex-col gap-3 border-b pb-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{animal.name}</h1>
              <div
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: difficultyConfig.color,
                  color: "white",
                }}
              >
                {difficultyConfig.label}
              </div>
              {animal.tags && animal.tags.length > 0 && (
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
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Kennel {animal.kennelId}</span>
                <span>{animal.breed}</span>
                <span>{animal.weight} lbs</span>
                <span>{animal.age} years</span>
                <span>
                  {animal.isOutOfKennel ? "Out of Kennel" : "In Kennel"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {lastWalk ? (
                  <div className="flex items-center gap-4">
                    <span>
                      Last walk{" "}
                      {formatDistanceToNow(lastWalk.date, { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="size-3" />
                      {formatDuration(lastWalk.duration)}
                    </span>
                  </div>
                ) : (
                  <span>No walks completed</span>
                )}
              </div>
            </div>
          </div>
          <QuickReferenceDialog animal={animal} onStartWalk={handleStartWalk} />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column */}
        <div className="grid gap-4">
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

          {/* Medical Info */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Medical Information</h2>
            <div className="space-y-1.5">
              {animal.medicalNotes
                ?.filter((note) => note.isActive)
                .map((note, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {note.notes}
                  </p>
                )) ?? (
                <p className="text-sm text-muted-foreground">
                  No medical notes available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid gap-4">
          {/* General Notes */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-lg font-semibold">General Notes</h2>
            <div className="space-y-1.5">
              {animal.generalNotes
                ?.filter((note) => note.isActive)
                .map((note, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {note.notes}
                  </p>
                )) ?? (
                <p className="text-sm text-muted-foreground">
                  No general notes available
                </p>
              )}
            </div>
          </div>

          {/* Equipment & Handling */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-lg font-semibold">
              Equipment & Handling Tips
            </h2>
            <div className="grid gap-3">
              <div>
                <h3 className="mb-1.5 text-sm font-medium">In Kennel</h3>
                <div className="space-y-1.5">
                  {animal.inKennelNotes
                    ?.filter((note) => note.isActive)
                    .map((note, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {note.notes}
                      </p>
                    )) ?? (
                    <p className="text-sm text-muted-foreground">
                      No in-kennel notes available
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="mb-1.5 text-sm font-medium">Out of Kennel</h3>
                <div className="space-y-1.5">
                  {animal.outKennelNotes
                    ?.filter((note) => note.isActive)
                    .map((note, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {note.notes}
                      </p>
                    )) ?? (
                    <p className="text-sm text-muted-foreground">
                      No out-of-kennel notes available
                    </p>
                  )}
                </div>
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
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      walk.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
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
    </div>
  );
}
