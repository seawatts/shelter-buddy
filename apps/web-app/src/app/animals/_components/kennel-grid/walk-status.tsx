"use client";

import Link from "next/link";

import { Button } from "@acme/ui/button";

import type { Animal } from "../../types";
import { hasWalkInProgress } from "./utils";
import { WalkStatusBadge } from "./walk-status-badge";

interface WalkStatusProps {
  animal: Animal;
}

export function WalkStatus({ animal }: WalkStatusProps) {
  if (hasWalkInProgress(animal)) {
    return (
      <div className="flex flex-col items-end gap-2">
        <Button variant="destructive" asChild>
          <Link href={`/animals/${animal.id}/walk`}>Stop Walk</Link>
        </Button>
        <WalkStatusBadge animal={animal} />
      </div>
    );
  }

  if (
    !hasWalkInProgress(animal) &&
    // !hasBeenWalkedToday(animal) &&
    !animal.isOutOfKennel
  ) {
    return (
      <Button variant="default" asChild>
        <Link href={`/animals/${animal.id}/walk`}>Start Walk</Link>
      </Button>
    );
  }

  return null;
}
