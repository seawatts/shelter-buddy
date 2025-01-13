import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "./env";
import * as schema from "./schema";

// For migrations
export const migrationClient = postgres(env.POSTGRES_URL, { max: 1 });

// For query purposes
export const queryClient = postgres(env.POSTGRES_URL);
export const db = drizzle(queryClient, { schema });
