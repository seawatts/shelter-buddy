import { Suspense } from "react";
import { notFound } from "next/navigation";

import { db } from "@acme/db/client";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { Separator } from "@acme/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import { AnimalForm } from "../../rooms/[roomId]/kennels/[kennelId]/intake/_components/animal-form";
import { AnimalDetails } from "./_components/animal-details";

export default async function AnimalPage({
  params,
}: {
  params: Promise<{ animalId: string; shelterId: string }>;
}) {
  const { animalId, shelterId } = await params;

  const animal = await db.query.Animals.findFirst({
    where: (animal, { eq }) => eq(animal.id, animalId),
    with: {
      activities: true,
      kennelOccupants: {
        limit: 1,
        orderBy: (kennel, { desc }) => desc(kennel.startedAt),
        where: (kennel, { isNull }) => isNull(kennel.endedAt),
        with: {
          kennel: {
            with: {
              room: true,
            },
          },
        },
      },
      media: true,
      notes: true,
      tags: true,
      walks: true,
    },
  });

  if (!animal) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Animal Details</h1>
        <Button variant="outline" asChild>
          <a href={`/shelters/${shelterId}/rooms`}>
            <Icons.ChevronLeft className="mr-2 size-4" />
            Back to Rooms
          </a>
        </Button>
      </div>
      <Separator className="my-6" />

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Suspense fallback={<AnimalDetailsSkeleton />}>
            <AnimalDetails animal={animal} />
          </Suspense>
        </TabsContent>

        <TabsContent value="edit">
          <Suspense fallback={<AnimalFormSkeleton />}>
            <AnimalForm
              kennelId={animal.kennelOccupants[0]?.kennel.id ?? ""}
              roomId={animal.kennelOccupants[0]?.kennel.room.id ?? ""}
              shelterId={shelterId}
              initialData={{
                ...(animal.externalId !== null && {
                  externalId: animal.externalId,
                }),
                approvedActivities: animal.notes
                  .filter(
                    (note) =>
                      note.type === "approvedActivities" && note.isActive,
                  )
                  .map((note) => ({
                    activity: note.notes,
                    isApproved: true,
                  })),
                breed: animal.breed,
                difficultyLevel: animal.difficultyLevel,
                equipmentNotes: {
                  inKennel: animal.notes
                    .filter((note) => note.type === "inKennel" && note.isActive)
                    .map((note) => note.notes)
                    .join("\n"),
                  outOfKennel: animal.notes
                    .filter(
                      (note) => note.type === "outKennel" && note.isActive,
                    )
                    .map((note) => note.notes)
                    .join("\n"),
                },
                gender: animal.gender,
                generalNotes: animal.notes
                  .filter((note) => note.type === "general" && note.isActive)
                  .map((note) => note.notes)
                  .join("\n"),
                intakeFormImagePath: null,
                isFido: animal.isFido,
                name: animal.name,
                staffLeashUp: animal.notes.some(
                  (note) =>
                    note.type === "staffRequirement" &&
                    note.isActive &&
                    note.notes === "Staff must leash up",
                ),
                staffReturn: animal.notes.some(
                  (note) =>
                    note.type === "staffRequirement" &&
                    note.isActive &&
                    note.notes === "Staff must return",
                ),
              }}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnimalDetailsSkeleton() {
  return (
    <div className="grid animate-pulse gap-4">
      <div className="h-24 rounded-lg bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-4">
          <div className="h-48 rounded-lg bg-muted" />
          <div className="h-48 rounded-lg bg-muted" />
        </div>
        <div className="grid gap-4">
          <div className="h-48 rounded-lg bg-muted" />
          <div className="h-48 rounded-lg bg-muted" />
          <div className="h-48 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}

function AnimalFormSkeleton() {
  return (
    <div className="grid animate-pulse gap-4">
      <div className="h-12 rounded-lg bg-muted" />
      <div className="grid gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-12 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
