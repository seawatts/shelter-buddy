"use client";

import Link from "next/link";

import type { AnimalType } from "@acme/db/schema";
import { Badge } from "@acme/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Icons } from "@acme/ui/icons";
import { ScrollArea } from "@acme/ui/scroll-area";

interface BehavioralInsightsProps {
  data: {
    redFlags: AnimalType[];
    purpleToYellow: AnimalType[];
    goodBehavior: AnimalType[];
  };
}

export function BehavioralInsights({ data }: BehavioralInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.Activity className="size-4" />
          Behavioral Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="mb-2 font-semibold text-destructive">
              Red Flag Cases ({data.redFlags.length})
            </h3>
            <ScrollArea className="h-32">
              <div className="flex flex-col gap-2">
                {data.redFlags.map((animal) => (
                  <Link
                    key={animal.id}
                    href={`/shelters/${animal.shelterId}/animals/${animal.id}`}
                    className="group flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted"
                  >
                    <span className="font-medium">{animal.name}</span>
                    <Badge variant="destructive">Red</Badge>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-primary">
              Potential Yellow Cases ({data.purpleToYellow.length})
            </h3>
            <ScrollArea className="h-32">
              <div className="flex flex-col gap-2">
                {data.purpleToYellow.map((animal) => (
                  <Link
                    key={animal.id}
                    href={`/shelters/${animal.shelterId}/animals/${animal.id}`}
                    className="group flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted"
                  >
                    <span className="font-medium">{animal.name}</span>
                    <Badge variant="secondary">Purple → Yellow</Badge>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-green-500">
              Good Behavior ({data.goodBehavior.length})
            </h3>
            <ScrollArea className="h-32">
              <div className="flex flex-col gap-2">
                {data.goodBehavior.map((animal) => (
                  <Link
                    key={animal.id}
                    href={`/shelters/${animal.shelterId}/animals/${animal.id}`}
                    className="group flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted"
                  >
                    <span className="font-medium">{animal.name}</span>
                    <Badge variant="outline">Good Progress</Badge>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
