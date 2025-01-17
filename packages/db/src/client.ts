import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

import * as schema from "./schema";

// import postgres from "postgres";

// For migrations
// export const migrationClient = postgres(env.POSTGRES_URL, { max: 1 });

// For query purposes
// export const queryClient = postgres(env.POSTGRES_URL);
// export const db = drizzle(queryClient, { schema });
export const db = drizzle(sql, { schema });
