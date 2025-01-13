import { db } from "@acme/db/client";

import { Header } from "~/components/header";
import { WalkProgress } from "~/components/walk-progress";
import { KennelGrid } from "./_components/kennel-grid";
import { searchParamsCache } from "./search-params";

export default async function AnimalsPage(props: {
  searchParams: Promise<{
    viewMode: string;
    difficultyFilter: string;
    tagFilter: string;
  }>;
}) {
  const { tagFilter } = await searchParamsCache.parse(props.searchParams);

  const animals = await db.query.Animals.findMany({
    with: {
      activities: true,
      kennelOccupants: {
        limit: 1,
        orderBy: (kennel, { desc }) => desc(kennel.startedAt),
        where: (kennel, { isNull }) => isNull(kennel.endedAt),
        with: {
          kennel: {
            with: {
              room: true,
            },
          },
        },
      },
      media: true,
      notes: true,
      tags: true,
      walks: {
        orderBy: (walk, { desc }) => desc(walk.startedAt),
        with: {
          media: true,
        },
      },
    },
  });

  const kennels = await db.query.Kennels.findMany({
    with: {
      room: true,
    },
  });

  const selectedTags = tagFilter.split(",").filter(Boolean);

  // Filter animals by tags if any are selected
  const filteredAnimals =
    selectedTags.length > 0
      ? animals.filter((animal) =>
          selectedTags.some((tag) => animal.tags.some((t) => t.tag === tag)),
        )
      : animals;

  return (
    <div>
      <div className="sticky top-0 z-10 flex flex-col gap-2 bg-background p-4 sm:gap-8 sm:p-8">
        <Header />
        <WalkProgress animals={animals} />
      </div>
      <div className="p-4 sm:p-8">
        <KennelGrid animals={filteredAnimals} kennels={kennels} />
      </div>
    </div>
  );
}
