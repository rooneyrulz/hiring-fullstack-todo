import express from "express";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";

export function createApp() {
    const app = express();

    app.use(express.json({ limit: "16kb" }));

    app.get("/api/health", (_req, res) => {
        res.json({ status: "ok", uptime: process.uptime() });
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
