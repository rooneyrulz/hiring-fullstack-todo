import { z } from "zod";

// Load .env into process.env for local development.
// In production the platform injects variables, so a missing file is fine.
try {
    process.loadEnvFile();
} catch {
    // no .env file present
}

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.url(),
    CLIENT_ORIGIN: z.url().default("http://localhost:5173"),
    LOG_LEVEL: z
        .enum(["error", "warn", "info", "debug", "trace", "silent"])
        .default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error(
        "Invalid environment variables:\n" + z.prettifyError(parsed.error),
    );
    process.exit(1);
}

export const env = parsed.data;
