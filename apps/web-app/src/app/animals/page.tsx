import { Badge } from "@acme/ui/badge";
import { Separator } from "@acme/ui/separator";

import { ScrollToBottom } from "./_components/scroll-to-bottom";
import { TagFilter } from "./_components/tag-filter";
import { AnimalsView } from "./_components/view";
import { ViewModeToggle } from "./_components/view-mode-toggle";
import { WalkProgress } from "./_components/walk-progress";
import { mockAnimals } from "./_mock-data/animals";
import { mockKennels } from "./_mock-data/kennels";
import { DIFFICULTY_COLORS } from "./difficulty-config";
import { searchParamsCache } from "./search-params";

function getCurrentShift(): {
  label: string;
  variant: "default" | "secondary" | "outline";
} {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 13) {
    return { label: "AM", variant: "default" };
  } else if (hour >= 13 && hour < 21) {
    return { label: "Mid Day", variant: "secondary" };
  } else {
    return { label: "Evening", variant: "outline" };
  }
}

export default async function AnimalsPage(props: {
  searchParams: Promise<{
    viewMode: string;
    difficultyFilter: string;
    tagFilter: string;
  }>;
}) {
  await searchParamsCache.parse(props.searchParams);

  const currentShift = getCurrentShift();

  const dayAndMonth = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  const fullDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ScrollToBottom>
      <div>
        <div className="sticky top-0 z-10 flex flex-col gap-4 bg-background p-6 sm:gap-8 sm:p-8">
          {/* Header Section */}
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold sm:text-4xl">
                  {dayAndMonth}, {currentShift.label}
                </h1>
                <p className="mt-1 text-base text-muted-foreground sm:text-lg">
                  {fullDate}
                </p>
              </div>
              <ViewModeToggle />
            </div>
            <div className="flex flex-row gap-2">
              <Badge
                variant="secondary"
                className="flex items-center justify-center gap-2"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: DIFFICULTY_COLORS.Purple }}
                />
                2 Volunteers
              </Badge>
              <Badge
                variant="secondary"
                className="flex items-center justify-center gap-2"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: DIFFICULTY_COLORS.Yellow }}
                />
                4 Volunteers
              </Badge>
            </div>
          </div>
          <WalkProgress data={mockAnimals} />
          <TagFilter data={mockAnimals} />
          <Separator />
          <AnimalsView kennels={mockKennels} animals={mockAnimals} />
        </div>
      </div>
    </ScrollToBottom>
  );
}
