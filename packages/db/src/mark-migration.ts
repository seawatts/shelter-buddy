import { sql } from "drizzle-orm";

import { db } from "./client";

try {
  await db.execute(sql`
    INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at)
    VALUES (0, 'initial_migration', EXTRACT(EPOCH FROM NOW())::bigint)
  `);
  console.log("Successfully marked migration as applied");
} catch (error) {
  console.error("Error marking migration as applied:", error);
  throw error;
}
