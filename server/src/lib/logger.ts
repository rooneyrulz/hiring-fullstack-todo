import { pino } from "pino";
import { env } from "../config/env.js";

export const logger = pino({
    level: env.LOG_LEVEL ?? "info",
    base: {
        service: "todo-api",
        env: env.NODE_ENV,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport:
        env.NODE_ENV !== "production"
            ? {
                  targets: [
                      {
                          target: "pino/file", // Destination A: Local log file
                          options: {
                              destination: "./logs/logger.log",
                              mkdir: true,
                          },
                      },
                      {
                          target: "pino-pretty", // Destination B: Clean console formatting (Dev)
                          options: { colorize: true },
                      },
                  ],
              }
            : undefined,
});
