import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  difficultyFilter: parseAsString.withDefault(""),
  viewMode: parseAsString.withDefault("grid"),
});
