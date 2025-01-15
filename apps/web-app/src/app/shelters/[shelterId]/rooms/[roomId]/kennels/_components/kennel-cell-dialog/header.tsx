import { useMemo } from "react";
import { formatDistance } from "date-fns";
import { Timer } from "lucide-react";

import type { AnimalTypeWithRelations, KennelType } from "@acme/db/schema";
import { Badge } from "@acme/ui/badge";
import { DialogTitle } from "@acme/ui/dialog";
import { DrawerTitle } from "@acme/ui/drawer";
import { cn } from "@acme/ui/lib/utils";

import { getLastCompletedWalk } from "../utils";
import { KennelCellDialogHeaderButtons } from "./header-buttons";

interface KennelHeaderProps {
  animal?: AnimalTypeWithRelations;
  kennel: KennelType;
  variant: "dialog" | "drawer";
}

export function KennelCellDialogHeader({
  animal,
  kennel,
  variant,
}: KennelHeaderProps) {
  const lastWalk = useMemo(
    () => (animal ? getLastCompletedWalk(animal) : null),
    [animal],
  );

  const lastWalkInfo = useMemo(() => {
    if (!lastWalk) {
      return (
        <span className="text-xs text-muted-foreground">
          No walks completed
        </span>
      );
    }

    if (variant === "drawer") {
      return (
        <span className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span>
            Last walk{" "}
            {formatDistance(new Date(), lastWalk.endedAt, {
              addSuffix: true,
            })}
          </span>
          <span className="flex items-center gap-1">
            <Timer className="size-3" />
            {lastWalk.duration} min
          </span>
        </span>
      );
    }

    return `Last walk: ${formatDistance(new Date(), lastWalk.endedAt, {
      addSuffix: true,
    })} (${lastWalk.duration} min)`;
  }, [lastWalk, variant]);

  const Title = variant === "drawer" ? DrawerTitle : DialogTitle;

  return (
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Title>
            {!animal && `Add dog to kennel ${kennel.name}`}
            {animal && kennel.name}{" "}
            {animal && `${variant === "drawer" ? "" : "- "}${animal.name}`}
          </Title>
          {animal?.tags && animal.tags.length > 0 && (
            <div className="flex gap-1">
              {animal.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  className={cn("rounded-full text-xs", {
                    "bg-gray-400 dark:bg-gray-500": tag.tag === "last",
                    "bg-gray-500 dark:bg-gray-400": tag.tag === "first",
                  })}
                >
                  {tag.tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {animal && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{lastWalkInfo}</p>
          </div>
        )}
      </div>
      {animal && <KennelCellDialogHeaderButtons animal={animal} />}
    </div>
  );
}
