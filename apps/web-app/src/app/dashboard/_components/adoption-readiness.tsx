"use client";

import Link from "next/link";

import type { AnimalType } from "@acme/db/schema";
import { Badge } from "@acme/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Icons } from "@acme/ui/icons";
import { ScrollArea } from "@acme/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

interface AdoptionReadinessProps {
  data: {
    ready: AnimalType[];
    needsWork: AnimalType[];
  };
}

export function AdoptionReadiness({ data }: AdoptionReadinessProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.Heart className="size-4" />
          Adoption Readiness
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ready">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ready">
              Ready for Adoption ({data.ready.length})
            </TabsTrigger>
            <TabsTrigger value="progress">
              In Progress ({data.needsWork.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ready" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="grid gap-4 md:grid-cols-2">
                {data.ready.map((animal) => (
                  <Link
                    key={animal.id}
                    href={`/shelters/${animal.shelterId}/animals/${animal.id}`}
                    className="group flex flex-col gap-2 rounded-md border border-border p-3 hover:bg-muted"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{animal.name}</span>
                      <Badge variant="secondary">Ready</Badge>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Icons.Calendar className="size-3" />
                        {animal.birthDate
                          ? `${new Date(
                              animal.birthDate,
                            ).toLocaleDateString()} (${Math.floor(
                              (Date.now() -
                                new Date(animal.birthDate).getTime()) /
                                (1000 * 60 * 60 * 24 * 365),
                            )} years)`
                          : "Age unknown"}
                      </div>
                      {animal.breed && (
                        <div className="flex items-center gap-2">
                          <Icons.Star className="size-3" />
                          {animal.breed}
                        </div>
                      )}
                      {animal.weight && (
                        <div className="flex items-center gap-2">
                          <Icons.Activity className="size-3" />
                          {animal.weight} lbs
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="progress" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="grid gap-4 md:grid-cols-2">
                {data.needsWork.map((animal) => (
                  <Link
                    key={animal.id}
                    href={`/shelters/${animal.shelterId}/animals/${animal.id}`}
                    className="group flex flex-col gap-2 rounded-md border border-border p-3 hover:bg-muted"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{animal.name}</span>
                      <Badge variant="secondary">In Training</Badge>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Icons.Calendar className="size-3" />
                        {animal.birthDate
                          ? `${new Date(
                              animal.birthDate,
                            ).toLocaleDateString()} (${Math.floor(
                              (Date.now() -
                                new Date(animal.birthDate).getTime()) /
                                (1000 * 60 * 60 * 24 * 365),
                            )} years)`
                          : "Age unknown"}
                      </div>
                      {animal.breed && (
                        <div className="flex items-center gap-2">
                          <Icons.Star className="size-3" />
                          {animal.breed}
                        </div>
                      )}
                      {animal.weight && (
                        <div className="flex items-center gap-2">
                          <Icons.Activity className="size-3" />
                          {animal.weight} lbs
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
