import { vi } from "vitest";

// Swap the production (Neon) database for an in-memory Postgres. Application code keeps importing
// `db` from src/db/index.ts as usual and never knows the difference.
vi.mock("../src/db/index.js", async () => {
  const { createTestDb } = await import("./helpers/test-db.js");
  return { db: await createTestDb() };
});
