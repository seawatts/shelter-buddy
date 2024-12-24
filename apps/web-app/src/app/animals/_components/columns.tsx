"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowUpDown,
  Clock,
  MoreHorizontal,
} from "lucide-react";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import type { Animal, WalkSession } from "../types";
import { DIFFICULTY_CONFIG } from "../difficulty-config";

// Custom icons for activities
const PoopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <path d="M12,2C6.477,2,2,6.477,2,12c0,5.523,4.477,10,10,10s10-4.477,10-10C22,6.477,17.523,2,12,2z M12,20 c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S16.418,20,12,20z M15.5,8.5c-0.827,0-1.5,0.673-1.5,1.5s0.673,1.5,1.5,1.5 s1.5-0.673,1.5-1.5S16.327,8.5,15.5,8.5z M8.5,8.5C7.673,8.5,7,9.173,7,10s0.673,1.5,1.5,1.5S10,10.827,10,10S9.327,8.5,8.5,8.5z M12,14c-2.209,0-4,1.791-4,4h8C16,15.791,14.209,14,12,14z" />
  </svg>
);

const PeeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <path d="M12,2C6.477,2,2,6.477,2,12c0,5.523,4.477,10,10,10s10-4.477,10-10C22,6.477,17.523,2,12,2z M12,20 c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S16.418,20,12,20z M16,11c0,2.209-1.791,4-4,4s-4-1.791-4-4s1.791-4,4-4 S16,8.791,16,11z" />
  </svg>
);

const BallIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <path d="M12,2C6.477,2,2,6.477,2,12c0,5.523,4.477,10,10,10s10-4.477,10-10C22,6.477,17.523,2,12,2z M12,20 c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S16.418,20,12,20z" />
  </svg>
);

// New icons for additional activities
const AccidentIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L2 12l10 10 10-10L12 2z" />
    <path d="M12 16v-4" />
    <circle cx="12" cy="8" r="1" />
  </svg>
);

const TreatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <path d="M12,3L4,9v12h16V9L12,3z M18,19H6V10l6-4.5l6,4.5V19z" />
  </svg>
);

const TrainingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <path d="M9,21H5c-1.1,0-2-0.9-2-2V5c0-1.1,0.9-2,2-2h4c1.1,0,2,0.9,2,2v14C11,20.1,10.1,21,9,21z M19,21h-4c-1.1,0-2-0.9-2-2V5 c0-1.1,0.9-2,2-2h4c1.1,0,2,0.9,2,2v14C21,20.1,20.1,21,19,21z" />
  </svg>
);

const SocialIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <path d="M16,13c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S17.1,13,16,13z M8,13c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S9.1,13,8,13z M16,9 c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S14.9,9,16,9z M8,9c1.1,0,2-0.9,2-2S9.1,5,8,5S6,5.9,6,7S6.9,9,8,9z" />
  </svg>
);

const ActivityIcons = ({
  activities,
}: {
  activities?: WalkSession["activities"];
}) => {
  if (!activities) return null;

  const renderActivityIcon = (
    condition: boolean | undefined,
    icon: React.ReactNode,
    tooltip: string,
    color: string,
  ) => {
    if (!condition) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className={color}>{icon}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* Bathroom Activities */}
      {renderActivityIcon(
        activities.poop,
        <PoopIcon />,
        "Pooped during walk",
        "text-amber-600",
      )}
      {renderActivityIcon(
        activities.pee,
        <PeeIcon />,
        "Peed during walk",
        "text-yellow-500",
      )}
      {renderActivityIcon(
        activities.accident,
        <AccidentIcon />,
        "Had an accident",
        "text-red-500",
      )}

      {/* Play Activities */}
      {renderActivityIcon(
        activities.playedBall,
        <BallIcon />,
        "Played with ball",
        "text-blue-500",
      )}
      {renderActivityIcon(
        activities.playedTug,
        <BallIcon />,
        "Played tug of war",
        "text-blue-500",
      )}
      {renderActivityIcon(
        activities.playedFetch,
        <BallIcon />,
        "Played fetch",
        "text-blue-500",
      )}

      {/* Training/Behavior */}
      {renderActivityIcon(
        activities.trained,
        <TrainingIcon />,
        "Did training exercises",
        "text-purple-500",
      )}
      {renderActivityIcon(
        activities.treats,
        <TreatIcon />,
        "Got treats",
        "text-orange-500",
      )}

      {/* Incidents */}
      {renderActivityIcon(
        activities.pulled,
        <AlertTriangle />,
        "Pulled on leash",
        "text-yellow-500",
      )}
      {renderActivityIcon(
        activities.dogReactive,
        <AlertTriangle />,
        "Dog reactive during walk",
        "text-red-500",
      )}
      {renderActivityIcon(
        activities.humanReactive,
        <AlertTriangle />,
        "Human reactive during walk",
        "text-red-500",
      )}
      {renderActivityIcon(
        activities.aggressive,
        <AlertTriangle />,
        "Showed aggression",
        "text-red-500",
      )}
      {renderActivityIcon(
        activities.bite,
        <AlertTriangle />,
        "Attempted to bite",
        "text-red-600",
      )}

      {/* Health/Wellness */}
      {renderActivityIcon(
        activities.vomit,
        <AlertTriangle />,
        "Vomited",
        "text-red-500",
      )}
      {renderActivityIcon(
        activities.diarrhea,
        <AlertTriangle />,
        "Had diarrhea",
        "text-red-500",
      )}
      {renderActivityIcon(
        activities.limping,
        <AlertTriangle />,
        "Was limping",
        "text-orange-500",
      )}
      {renderActivityIcon(
        activities.frequentUrination,
        <AlertTriangle />,
        "Frequent urination",
        "text-orange-500",
      )}
      {renderActivityIcon(
        activities.looseStool,
        <AlertTriangle />,
        "Had loose stool",
        "text-orange-500",
      )}
      {renderActivityIcon(
        activities.bloodyStool,
        <AlertTriangle />,
        "Had bloody stool",
        "text-red-500",
      )}
      {renderActivityIcon(
        activities.scratching,
        <AlertTriangle />,
        "Excessive scratching",
        "text-orange-500",
      )}
      {renderActivityIcon(
        activities.shakingHead,
        <AlertTriangle />,
        "Shaking head frequently",
        "text-orange-500",
      )}
      {renderActivityIcon(
        activities.coughing,
        <AlertTriangle />,
        "Coughing",
        "text-orange-500",
      )}
      {renderActivityIcon(
        activities.sneezing,
        <AlertTriangle />,
        "Sneezing",
        "text-orange-500",
      )}
      {renderActivityIcon(
        activities.eyeDischarge,
        <AlertTriangle />,
        "Eye discharge observed",
        "text-orange-500",
      )}
      {renderActivityIcon(
        activities.noseDischarge,
        <AlertTriangle />,
        "Nose discharge observed",
        "text-orange-500",
      )}
      {renderActivityIcon(
        activities.hotSpots,
        <AlertTriangle />,
        "Hot spots observed",
        "text-orange-500",
      )}

      {/* Social */}
      {renderActivityIcon(
        activities.likesSniffing,
        <SocialIcon />,
        "Enjoys sniffing",
        "text-green-500",
      )}
      {renderActivityIcon(
        activities.likesPets,
        <SocialIcon />,
        "Enjoys being pet",
        "text-green-500",
      )}
      {renderActivityIcon(
        activities.eatsEverything,
        <AlertTriangle />,
        "Tries to eat things on walk",
        "text-yellow-500",
      )}
      {renderActivityIcon(
        activities.goodBehavior,
        <SocialIcon />,
        "Showed good behavior",
        "text-green-600",
      )}
    </div>
  );
};

const WalkBadge = ({ session }: { session?: WalkSession }) => {
  if (!session) {
    return (
      <Badge variant="outline" className="bg-muted/50">
        Not Scheduled
      </Badge>
    );
  }

  if (!session.completed) {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="outline" className="bg-muted">
          <Clock className="mr-1 h-3 w-3" />
          {session.time}
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
                <Clock className="mr-1 h-3 w-3" />
                {session.duration}min
              </Badge>
              <ActivityIcons activities={session.activities} />
            </div>
            {session.walkedBy && (
              <span className="text-xs text-muted-foreground">
                by {session.walkedBy.name}
              </span>
            )}
          </div>
        </TooltipTrigger>
        {session.notes && (
          <TooltipContent>
            <p>{session.notes}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export const columns: ColumnDef<Animal>[] = [
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
    accessorKey: "kennelNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Kennel #
          <ArrowUpDown className="ml-2 h-4 w-4" />
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "species",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("species")}</Badge>
    ),
    header: "Species",
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    cell: ({ row }) => {
      const session = row.original.walks.am;
      return <WalkBadge session={session} />;
    },
    header: "Morning Walk",
    id: "morningWalk",
  },
  {
    cell: ({ row }) => {
      const session = row.original.walks.midday;
      return <WalkBadge session={session} />;
    },
    header: "Midday Walk",
    id: "middayWalk",
  },
  {
    cell: ({ row }) => {
      const session = row.original.walks.pm;
      return <WalkBadge session={session} />;
    },
    header: "Evening Walk",
    id: "eveningWalk",
  },
  {
    accessorKey: "notes",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.getValue("notes")}</div>
    ),
    header: "Notes",
  },
  {
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
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
