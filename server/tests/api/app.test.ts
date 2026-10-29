import { describe, expect, it } from "vitest";
import { api } from "../helpers/app.js";

describe("app wiring", () => {
  it("answers the health check", async () => {
    const response = await api().get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("returns the standard error shape for unknown routes", async () => {
    const response = await api().get("/api/nope");

    expect(response.status).toBe(404);
    expect(response.body.error).toMatchObject({ code: "ROUTE_NOT_FOUND" });
  });

  it("sets security headers and hides the framework", async () => {
    const response = await api().get("/api/health");

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("allows the configured client origin and no other", async () => {
    const allowed = await api()
      .options("/api/todos")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "PATCH");
    const stranger = await api()
      .options("/api/todos")
      .set("Origin", "https://evil.example")
      .set("Access-Control-Request-Method", "PATCH");

    expect(allowed.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(stranger.headers["access-control-allow-origin"]).not.toBe(
      "https://evil.example",
    );
  });
});
