"use client";

import { useRouter } from "next/navigation";

import type { Animal } from "../../types";
import { DIFFICULTY_CONFIG } from "../../difficulty-config";
import { QuickReferenceDialog } from "./quick-reference-dialog";

interface AnimalDetailsProps {
  animal: Animal;
}

export function AnimalDetails({ animal }: AnimalDetailsProps) {
  const router = useRouter();
  const difficultyConfig = DIFFICULTY_CONFIG[animal.difficultyLevel];

  const handleStartWalk = () => {
    router.push(`/animals/${animal.id}/walk`);
  };

  return (
    <div className="grid gap-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{animal.name}</h1>
          <div
            className="rounded-full px-3 py-1 text-sm font-medium"
            style={{
              backgroundColor: difficultyConfig.color,
              color: "white",
            }}
          >
            {difficultyConfig.label}
          </div>
        </div>
        <QuickReferenceDialog animal={animal} onStartWalk={handleStartWalk} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Basic Information</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Kennel Number</dt>
                <dd className="text-lg font-medium">{animal.kennelNumber}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Breed</dt>
                <dd className="text-lg font-medium">{animal.breed}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Age</dt>
                <dd className="text-lg font-medium">{animal.age} years</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Weight</dt>
                <dd className="text-lg font-medium">{animal.weight} lbs</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">FIDO Status</dt>
                <dd className="text-lg font-medium">
                  {animal.isFido ? "Yes" : "No"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Available Date
                </dt>
                <dd className="text-lg font-medium">{animal.availableDate}</dd>
              </div>
            </dl>
          </div>

          {/* Approved Activities */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Approved Activities</h2>
            <div className="space-y-2">
              {animal.approvedActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm">{activity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Info */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Medical Information</h2>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {animal.medicalNotes ?? "No medical notes available"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* General Notes */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">General Notes</h2>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {animal.generalNotes ?? "No general notes available"}
              </p>
            </div>
          </div>

          {/* Equipment & Handling */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Equipment & Handling Tips
            </h2>
            <div className="grid gap-4">
              <div>
                <h3 className="mb-2 font-medium">In Kennel</h3>
                <p className="text-sm text-muted-foreground">
                  {animal.inKennelNotes ?? "No in-kennel notes available"}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Out of Kennel</h3>
                <p className="text-sm text-muted-foreground">
                  {animal.outKennelNotes ?? "No out-of-kennel notes available"}
                </p>
              </div>
            </div>
          </div>

          {/* Walking History */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Walking History</h2>
            <div className="space-y-4">
              {Object.entries(animal.walks).map(([date, walk]) => (
                <div
                  key={date}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <span>{new Date(date).toLocaleDateString()}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-sm ${
                      walk.completed
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {walk.completed ? "Completed" : "Not Walked"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
