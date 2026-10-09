import express from "express";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { todoRouter } from "./modules/todos/todo.routes.js";
import { env } from "./config/env.js";
import { pinoHttp } from "pino-http";
import helmet from "helmet";
import cors from "cors";
import { logger } from "./lib/logger.js";

export function createApp() {
    const app = express();

    app.use(helmet());
    app.use(
        cors({
            origin: env.CLIENT_ORIGIN,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        }),
    );
    app.use(
        pinoHttp({
            logger,
            autoLogging: { ignore: (req) => req.url === "/api/health" },
            customLogLevel: (_req, res, err) => {
                if (err || res.statusCode >= 500) return "error";
                if (res.statusCode >= 400) return "warn";
                return "info";
            },
        }),
    );

    app.use(express.json({ limit: "16kb" }));

    app.get("/api/health", (_req, res) => {
        res.json({ status: "ok", uptime: process.uptime() });
    });

    app.use("/api/todos", todoRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
