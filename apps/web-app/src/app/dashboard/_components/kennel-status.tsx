"use client";

import Link from "next/link";

import type { AnimalType } from "@acme/db/schema";
import { Badge } from "@acme/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Icons } from "@acme/ui/icons";
import { ScrollArea } from "@acme/ui/scroll-area";

interface KennelStatusProps {
  animals: (AnimalType & {
    kennelOccupants: {
      kennel: {
        id: string;
        name: string;
      };
    }[];
  })[];
}

export function KennelStatus({ animals }: KennelStatusProps) {
  const kennelGroups: Record<string, AnimalType[]> = {};

  for (const animal of animals) {
    const currentKennel = animal.kennelOccupants[0]?.kennel;
    const key = currentKennel?.name ?? "unassigned";
    kennelGroups[key] = [...(kennelGroups[key] ?? []), animal];
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.Home className="size-4" />
          Kennel Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="flex flex-col gap-4">
            {Object.entries(kennelGroups).map(([kennelName, animals]) => (
              <div key={kennelName} className="space-y-2">
                <h3 className="font-semibold">
                  {kennelName === "unassigned" ? "Unassigned" : kennelName} (
                  {animals.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {animals.map((animal) => (
                    <Link
                      key={animal.id}
                      href={`/animals/${animal.id}`}
                      className="group flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{animal.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {animal.breed}
                        </span>
                      </div>
                      <Badge
                        variant={
                          kennelName === "unassigned"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {kennelName === "unassigned"
                          ? "Needs Kennel"
                          : "Assigned"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
