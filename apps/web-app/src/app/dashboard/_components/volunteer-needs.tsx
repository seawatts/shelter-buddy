"use client";

import Link from "next/link";

import type { AnimalType } from "@acme/db/schema";
import { Badge } from "@acme/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Icons } from "@acme/ui/icons";
import { ScrollArea } from "@acme/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

interface VolunteerNeedsProps {
  data: {
    notWalkedToday: AnimalType[];
    highEnergyPriority: AnimalType[];
    needsSocialization: AnimalType[];
  };
}

export function VolunteerNeeds({ data }: VolunteerNeedsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.Users className="size-4" />
          Volunteer Needs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="walks">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="walks">
              Walks ({data.notWalkedToday.length})
            </TabsTrigger>
            <TabsTrigger value="energy">
              High Energy ({data.highEnergyPriority.length})
            </TabsTrigger>
            <TabsTrigger value="social">
              Socialization ({data.needsSocialization.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="walks" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col gap-2">
                {data.notWalkedToday.map((animal) => (
                  <Link
                    key={animal.id}
                    href={`/shelters/${animal.shelterId}/animals/${animal.id}`}
                    className="group flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted"
                  >
                    <span className="font-medium">{animal.name}</span>
                    <Badge variant="secondary">Needs Walk</Badge>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="energy" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col gap-2">
                {data.highEnergyPriority.map((animal) => (
                  <Link
                    key={animal.id}
                    href={`/shelters/${animal.shelterId}/animals/${animal.id}`}
                    className="group flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted"
                  >
                    <span className="font-medium">{animal.name}</span>
                    <Badge variant="secondary">High Energy</Badge>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="social" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col gap-2">
                {data.needsSocialization.map((animal) => (
                  <Link
                    key={animal.id}
                    href={`/shelters/${animal.shelterId}/animals/${animal.id}`}
                    className="group flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted"
                  >
                    <span className="font-medium">{animal.name}</span>
                    <Badge variant="secondary">Needs Socialization</Badge>
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
