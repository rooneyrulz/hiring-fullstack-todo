import { beforeEach, describe, expect, it } from "vitest";
import * as todoService from "../../src/modules/todos/todo.service.js";
import { resetDatabase } from "../helpers/db.js";

beforeEach(resetDatabase);

describe("todo.service", () => {
  it("toggles atomically: concurrent toggles never lose an update", async () => {
    const todo = await todoService.createTodo({ title: "t" });

    // Started in the same tick, so every call is in flight before any of them finishes.
    // A read-then-write toggle would let all ten read `false` and all write `true`.
    await Promise.all(
      Array.from({ length: 10 }, () => todoService.toggleTodoDone(todo.id)),
    );

    // An even number of toggles must land back where it started.
    const [after] = await todoService.listTodos();
    expect(after?.done).toBe(false);
  });
});
