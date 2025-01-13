import { db } from "@acme/db/client";

import { searchParamsCache } from "../search-params";

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
      kennelOccupants: {
        limit: 1,
        orderBy: (kennel, { desc }) => desc(kennel.startedAt),
        where: (kennel, { isNull }) => isNull(kennel.endedAt),
        with: {
          kennel: true,
        },
      },
      media: true,
      notes: true,
      tags: true,
      walks: true,
    },
  });

  const kennels = await db.query.Kennels.findMany();

  return <div></div>;
}
