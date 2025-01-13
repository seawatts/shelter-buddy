import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  difficultyFilter: parseAsString.withDefault(""),
  tagFilter: parseAsString.withDefault(""),
});
