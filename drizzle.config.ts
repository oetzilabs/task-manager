import { Config } from "drizzle-kit";

import { env } from "./src/env";

export default {
  driver: "pg",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
} satisfies Config;
