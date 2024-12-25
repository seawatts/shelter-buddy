"use client";

import { useQueryState } from "nuqs";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Icons } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";

import type { Animal } from "../types";

interface TagFilterProps {
  data: Animal[];
}

export function TagFilter({ data }: TagFilterProps) {
  const [tagFilter, setTagFilter] = useQueryState("tagFilter");

  // Get unique tags from all animals
  const uniqueTags = [...new Set(data.flatMap((animal) => animal.tags ?? []))];

  const selectedTags = tagFilter?.split(",").filter(Boolean) ?? [];

  // Count animals for each tag using a loop instead of reduce
  const tagCounts: Record<string, number> = {};
  for (const tag of uniqueTags) {
    tagCounts[tag] = data.filter((animal) => animal.tags?.includes(tag)).length;
  }

  const toggleTag = (tag: string) => {
    const currentTags = new Set(selectedTags);
    const hasTag = currentTags.has(tag);

    if (hasTag) {
      currentTags.delete(tag);
    } else {
      currentTags.add(tag);
    }

    void setTagFilter(currentTags.size > 0 ? [...currentTags].join(",") : null);
  };

  if (uniqueTags.length === 0) return null;

  return (
    <div className="flex w-full justify-center">
      <div className="grid w-full grid-cols-1 gap-4 sm:min-w-[640px] sm:max-w-[800px] md:grid-cols-2">
        <div className="flex items-center gap-2">
          <div className="relative flex h-12 w-full items-center gap-2 rounded-lg border border-dashed border-border bg-background/50 px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Tags
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "size-6 shrink-0 rounded-full",
                      // selectedTags.length > 0 &&
                      // "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    <Icons.ListFilter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel>Filter by tags</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {uniqueTags.map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                      className="capitalize"
                    >
                      {tag}
                      <Badge variant="secondary" className="ml-auto">
                        {tagCounts[tag]}
                      </Badge>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="capitalize"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    <Icons.X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-sm font-normal"
              onClick={() => void setTagFilter(null)}
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
