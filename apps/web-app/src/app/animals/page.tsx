import { Header } from "./_components/header";
import { ScrollToBottom } from "./_components/scroll-to-bottom";
import { AnimalsView } from "./_components/view";
import { WalkProgress } from "./_components/walk-progress";
import { mockAnimals } from "./_mock-data/animals";
import { mockKennels } from "./_mock-data/kennels";
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
        <div className="sticky top-0 z-10 flex flex-col gap-2 bg-background p-4 sm:gap-8 sm:p-8">
          <Header
            dayAndMonth={dayAndMonth}
            fullDate={fullDate}
            currentShift={currentShift}
          />
          <WalkProgress data={mockAnimals} />
        </div>
        <div className="p-4 sm:p-8">
          <AnimalsView kennels={mockKennels} animals={mockAnimals} />
        </div>
      </div>
    </ScrollToBottom>
  );
}
