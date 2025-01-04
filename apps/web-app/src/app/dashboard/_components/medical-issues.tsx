"use client";

import Link from "next/link";

import type { AnimalNoteType, AnimalType } from "@acme/db/schema";
import { Badge } from "@acme/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Icons } from "@acme/ui/icons";
import { ScrollArea } from "@acme/ui/scroll-area";

interface MedicalIssuesProps {
  animals: (AnimalType & {
    notes: AnimalNoteType[];
  })[];
}

export function MedicalIssues({ animals }: MedicalIssuesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.Activity className="size-4" />
          Medical Issues
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {animals.length} animals with active medical issues
            </span>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="flex flex-col gap-2">
              {animals.map((animal) => {
                const medicalNotes = animal.notes.filter(
                  (note) => note.type === "medical" && note.isActive,
                );

                return (
                  <Link
                    key={animal.id}
                    href={`/animals/${animal.id}`}
                    className="group flex flex-col gap-2 rounded-md border border-border p-3 hover:bg-muted"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{animal.name}</span>
                      <Badge variant="destructive">Medical</Badge>
                    </div>
                    {medicalNotes.map((note) => (
                      <p
                        key={note.id}
                        className="line-clamp-2 text-sm text-muted-foreground"
                      >
                        {note.summary ?? note.notes}
                      </p>
                    ))}
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
