"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { ArrowUpDown, Clock, MoreHorizontal } from "lucide-react";

import type { AnimalTypeWithRelations, WalkType } from "@acme/db/schema";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@acme/ui/tooltip";

import { DIFFICULTY_CONFIG } from "../../_utils/difficulty-config";
import { formatDuration } from "../kennel-grid/utils";

const WalkBadge = ({ session }: { session?: WalkType }) => {
  const durationInMinutes = useMemo(() => {
    if (!session?.endedAt) return 0;
    return Math.floor(
      (session.endedAt.getTime() - session.startedAt.getTime()) / (1000 * 60),
    );
  }, [session]);

  const formattedDuration = useMemo(
    () => formatDuration(durationInMinutes),
    [durationInMinutes],
  );

  if (!session) {
    return (
      <Badge variant="outline" className="bg-muted/50">
        Not Scheduled
      </Badge>
    );
  }

  if (session.status === "not_started") {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="outline" className="bg-muted">
          <Clock className="mr-1 size-3" />
          Not Started
        </Badge>
      </div>
    );
  }

  if (session.status === "in_progress") {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="outline" className="bg-muted">
          <Clock className="mr-1 size-3" />
          In Progress
        </Badge>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">
                <Clock className="mr-1 size-3" />
                {formattedDuration}
              </Badge>
            </div>
            {session.userId && (
              <span className="text-xs text-muted-foreground">
                by {session.userId}
              </span>
            )}
          </div>
        </TooltipTrigger>
        {/* {session.notes && (
          <TooltipContent>
            <p>{session.notes}</p>
          </TooltipContent>
        )} */}
      </Tooltip>
    </TooltipProvider>
  );
};

export const columns: ColumnDef<AnimalTypeWithRelations>[] = [
  {
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    id: "select",
  },
  {
    accessorKey: "kennelId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Kennel #
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "difficultyLevel",
    cell: ({ row }) => {
      const level = row.original.difficultyLevel;
      return (
        <Badge
          variant="outline"
          className="border-2"
          style={{
            borderColor: DIFFICULTY_CONFIG[level].color,
            color: DIFFICULTY_CONFIG[level].color,
          }}
        >
          {DIFFICULTY_CONFIG[level].label}
        </Badge>
      );
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Difficulty
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
  },
  {
    cell: ({ row }) => {
      const today = new Date().toISOString().split("T")[0];
      const morningWalk = row.original.walks.find((walk) => {
        const walkDate = new Date(walk.startedAt).toISOString().split("T")[0];
        return walkDate === today && new Date(walk.startedAt).getHours() < 12;
      });
      return <WalkBadge session={morningWalk} />;
    },
    header: "Morning Walk",
    id: "morningWalk",
  },
  {
    cell: ({ row }) => {
      const today = new Date().toISOString().split("T")[0];
      const middayWalk = row.original.walks.find((walk) => {
        const walkDate = new Date(walk.startedAt).toISOString().split("T")[0];
        const hours = new Date(walk.startedAt).getHours();
        return walkDate === today && hours >= 12 && hours < 17;
      });
      return <WalkBadge session={middayWalk} />;
    },
    header: "Midday Walk",
    id: "middayWalk",
  },
  {
    cell: ({ row }) => {
      const today = new Date().toISOString().split("T")[0];
      const eveningWalk = row.original.walks.find((walk) => {
        const walkDate = new Date(walk.startedAt).toISOString().split("T")[0];
        return walkDate === today && new Date(walk.startedAt).getHours() >= 17;
      });
      return <WalkBadge session={eveningWalk} />;
    },
    header: "Evening Walk",
    id: "eveningWalk",
  },
  {
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit animal</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
    header: "Actions",
    id: "actions",
  },
];
