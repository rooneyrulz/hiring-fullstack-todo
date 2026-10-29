import { sql } from "drizzle-orm";
import { db } from "../../src/db/index.js";

/** Empties every table between tests. */
export async function resetDatabase() {
  await db.execute(sql`TRUNCATE TABLE todos RESTART IDENTITY CASCADE`);
}
