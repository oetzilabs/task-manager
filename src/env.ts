import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

export const env = createEnv({
  /**
   * Specify what prefix the client-side variables must have.
   * This is enforced both on type-level and at runtime.
   */
  clientPrefix: "VITE_PUBLIC_",
  server: {
    DATABASE_URL: z.string().url(),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
  },
  client: {
    // VITE_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  /**
   * What object holds the environment variables at runtime.
   * Often `process.env` or `import.meta.env`
   */
  runtimeEnv: process.env,
  isServer: typeof window === "undefined",
});
