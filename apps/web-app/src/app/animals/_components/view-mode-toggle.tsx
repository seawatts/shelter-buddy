"use client";

import { LayoutGrid, MoreVertical, Table as TableIcon } from "lucide-react";
import { useQueryState } from "nuqs";

import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { cn } from "@acme/ui/lib/utils";

export type ViewMode = "table" | "grid";

export function ViewModeToggle() {
  const [viewMode, setViewMode] = useQueryState("viewMode");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Toggle view</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setViewMode("table")}
          className={cn(viewMode === "table" && "bg-accent")}
        >
          <TableIcon className="mr-2 h-4 w-4" />
          <span>Table View</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setViewMode("grid")}
          className={cn(viewMode === "grid" && "bg-accent")}
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          <span>Kennel View</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
