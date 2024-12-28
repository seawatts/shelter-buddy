import { db } from "@acme/db/client";

import { ScrollToBottom } from "../../components/scroll-to-bottom";
import { Header } from "./_components/header";
import { AnimalsView } from "./_components/view";
import { WalkProgress } from "./_components/walk-progress";
import { searchParamsCache } from "./_utils/search-params";

export default async function AnimalsPage(props: {
  searchParams: Promise<{
    viewMode: string;
    difficultyFilter: string;
    tagFilter: string;
  }>;
}) {
  await searchParamsCache.parse(props.searchParams);

  const animals = await db.query.Animals.findMany({
    with: {
      activities: true,
      media: true,
      notes: true,
      tags: true,
      walks: {
        with: {
          media: true,
        },
      },
    },
  });
  const kennels = await db.query.Kennels.findMany();

  return (
    <ScrollToBottom>
      <div>
        <div className="sticky top-0 z-10 flex flex-col gap-2 bg-background p-4 sm:gap-8 sm:p-8">
          <Header />
          <WalkProgress animals={animals} />
        </div>
        <div className="p-4 sm:p-8">
          <AnimalsView kennels={kennels} animals={animals} />
        </div>
      </div>
    </ScrollToBottom>
  );
}
