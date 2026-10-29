import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../helpers/app.js";
import { resetDatabase } from "../helpers/db.js";

const UNKNOWN_ID = "3f1c2a4e-9b7d-4c1a-8e2f-5a6b7c8d9e0f";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

beforeEach(resetDatabase);

async function createTodo(body: Record<string, unknown>) {
  const response = await api().post("/api/todos").send(body);
  expect(response.status).toBe(201);
  return response.body.data as {
    id: string;
    title: string;
    description: string | null;
    done: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

describe("GET /api/todos", () => {
  it("returns an empty list when there are no todos", async () => {
    const response = await api().get("/api/todos");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: [] });
  });

  it("returns the newest todo first", async () => {
    await createTodo({ title: "first" });
    await createTodo({ title: "second" });
    await createTodo({ title: "third" });

    const response = await api().get("/api/todos");

    expect(
      response.body.data.map((todo: { title: string }) => todo.title),
    ).toEqual(["third", "second", "first"]);
  });
});

describe("POST /api/todos", () => {
  it("creates a todo and returns it with server-generated fields", async () => {
    const todo = await createTodo({
      title: "Buy milk",
      description: "2 liters",
    });

    expect(todo).toMatchObject({
      title: "Buy milk",
      description: "2 liters",
      done: false,
    });
    expect(todo.id).toMatch(UUID);
    expect(new Date(todo.createdAt).toString()).not.toBe("Invalid Date");
  });

  it("trims the title and stores a blank description as null", async () => {
    const todo = await createTodo({
      title: "  Buy milk  ",
      description: "   ",
    });

    expect(todo.title).toBe("Buy milk");
    expect(todo.description).toBeNull();
  });

  it("ignores client-supplied id and done flags", async () => {
    const todo = await createTodo({ title: "x", done: true, id: UNKNOWN_ID });

    expect(todo.done).toBe(false);
    expect(todo.id).not.toBe(UNKNOWN_ID);
  });

  it.each([
    ["an empty title", { title: "   " }, "Title is required"],
    ["a missing title", { description: "only" }, "Title is required"],
    ["a non-string title", { title: 5 }, "Title must be a string"],
    [
      "a title over 200 characters",
      { title: "a".repeat(201) },
      "Title must be at most 200 characters",
    ],
  ])("rejects %s", async (_label, body, message) => {
    const response = await api().post("/api/todos").send(body);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
      details: [{ field: "title", message }],
    });
  });

  it("rejects a missing body with a readable message", async () => {
    const response = await api().post("/api/todos");

    expect(response.status).toBe(400);
    expect(response.body.error.details).toEqual([
      { field: "body", message: "Request body must be a JSON object" },
    ]);
  });

  it("rejects malformed JSON", async () => {
    const response = await api()
      .post("/api/todos")
      .set("Content-Type", "application/json")
      .send('{"title":');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_JSON");
  });

  it("rejects an oversized body", async () => {
    const response = await api()
      .post("/api/todos")
      .send({ title: "x", description: "y".repeat(17_000) });

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });
});

describe("PUT /api/todos/:id", () => {
  it("updates the title and leaves the description alone", async () => {
    const { id } = await createTodo({ title: "old", description: "keep me" });

    const response = await api().put(`/api/todos/${id}`).send({ title: "new" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id,
      title: "new",
      description: "keep me",
    });
  });

  it("clears the description when it is blank", async () => {
    const { id } = await createTodo({ title: "t", description: "remove me" });

    const response = await api()
      .put(`/api/todos/${id}`)
      .send({ description: "" });

    expect(response.body.data.description).toBeNull();
  });

  it("moves updatedAt forward", async () => {
    const todo = await createTodo({ title: "t" });
    await new Promise((resolve) => setTimeout(resolve, 10));

    const response = await api()
      .put(`/api/todos/${todo.id}`)
      .send({ title: "t2" });

    expect(new Date(response.body.data.updatedAt).getTime()).toBeGreaterThan(
      new Date(todo.updatedAt).getTime(),
    );
  });

  it("rejects a body with nothing to update", async () => {
    const { id } = await createTodo({ title: "t" });

    const response = await api().put(`/api/todos/${id}`).send({});

    expect(response.status).toBe(400);
    expect(response.body.error.details).toEqual([
      { field: "body", message: "Provide at least one of: title, description" },
    ]);
  });

  it("rejects a malformed id", async () => {
    const response = await api().put("/api/todos/123").send({ title: "x" });

    expect(response.status).toBe(400);
    expect(response.body.error.details[0]).toEqual({
      field: "id",
      message: "Invalid todo id",
    });
  });

  it("returns 404 for an unknown todo", async () => {
    const response = await api()
      .put(`/api/todos/${UNKNOWN_ID}`)
      .send({ title: "x" });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("TODO_NOT_FOUND");
  });
});

describe("PATCH /api/todos/:id/done", () => {
  it("flips the done flag each time", async () => {
    const { id } = await createTodo({ title: "t" });

    const first = await api().patch(`/api/todos/${id}/done`);
    const second = await api().patch(`/api/todos/${id}/done`);

    expect(first.body.data.done).toBe(true);
    expect(second.body.data.done).toBe(false);
  });

  it("returns 404 for an unknown todo and 400 for a malformed id", async () => {
    expect((await api().patch(`/api/todos/${UNKNOWN_ID}/done`)).status).toBe(
      404,
    );
    expect((await api().patch("/api/todos/nope/done")).status).toBe(400);
  });
});

describe("DELETE /api/todos/:id", () => {
  it("removes the todo and replies with no body", async () => {
    const { id } = await createTodo({ title: "t" });

    const response = await api().delete(`/api/todos/${id}`);
    const list = await api().get("/api/todos");

    expect(response.status).toBe(204);
    expect(response.text).toBe("");
    expect(list.body.data).toEqual([]);
  });

  it("returns 404 the second time and 400 for a malformed id", async () => {
    const { id } = await createTodo({ title: "t" });
    await api().delete(`/api/todos/${id}`);

    expect((await api().delete(`/api/todos/${id}`)).status).toBe(404);
    expect((await api().delete("/api/todos/abc")).status).toBe(400);
  });
});
