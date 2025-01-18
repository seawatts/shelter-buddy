import { sql } from "@vercel/postgres";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/vercel-postgres";
import postgres from "postgres";

import { env } from "./env";
import * as schema from "./schema";

// Create the appropriate database client based on the environment
let db:
  | ReturnType<typeof drizzle<typeof schema>>
  | ReturnType<typeof drizzlePostgres<typeof schema>>;

if (process.env.VERCEL) {
  // Use Vercel Postgres in production
  db = drizzle(sql, { schema });
} else {
  // Use direct Postgres connection in development (Supabase)
  const client = postgres(process.env.POSTGRES_URL!);
  db = drizzlePostgres(client, { schema });
}

export { db };
