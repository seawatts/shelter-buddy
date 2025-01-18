/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import type { drizzle } from "drizzle-orm/vercel-postgres";

import { env } from "./env";
import * as schema from "./schema";

// Create the appropriate database client based on the environment
let db:
  | ReturnType<typeof drizzle<typeof schema>>
  | ReturnType<typeof drizzlePostgres<typeof schema>>;

if (env.VERCEL) {
  const requiredDrizzle = require("drizzle-orm/vercel-postgres");
  const sql = require("@vercel/postgres");
  // Use Vercel Postgres in production
  db = requiredDrizzle.drizzle(sql, { schema });
} else {
  // Use direct Postgres connection in development (Supabase)
  const postgresJs = require("postgres");
  const requiredDrizzle = require("drizzle-orm/postgres-js");
  const client = postgresJs(env.POSTGRES_URL);

  db = requiredDrizzle.drizzle(client, { schema });
}

export { db };
