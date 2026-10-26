import { desc, eq, not, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { NewTodo, todos, type Todo } from "../../db/schema.js";
import type { CreateTodoInput, UpdateTodoInput } from "./todo.schemas.js";
import { AppError } from "../../errors/app-error.js";

const todoNotFound = () =>
    new AppError(404, "TODO_NOT_FOUND", "Todo not found");

export async function listTodos(): Promise<Todo[]> {
    return db.select().from(todos).orderBy(desc(todos.createdAt));
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
    const [todo] = await db
        .insert(todos)
        .values({ title: input.title, description: input.description ?? null })
        .returning();

    if (!todo) {
        throw new Error("Insert did not return a row");
    }
    return todo;
}

export async function updateTodo(
    id: string,
    input: UpdateTodoInput,
): Promise<Todo> {
    const changes: Partial<NewTodo> = {};
    if (input.title !== undefined) changes.title = input.title;
    if (input.description !== undefined)
        changes.description = input.description;

    const [todo] = await db
        .update(todos)
        .set(changes)
        .where(eq(todos.id, id))
        .returning();

    if (!todo) {
        throw todoNotFound();
    }
    return todo;
}

export async function toggleTodoDone(id: string): Promise<Todo> {
    const [todo] = await db
        .update(todos)
        .set({ done: not(todos.done), updatedAt: sql`now()` })
        .where(eq(todos.id, id))
        .returning();

    if (!todo) {
        throw todoNotFound();
    }
    return todo;
}

export async function deleteTodo(id: string): Promise<void> {
    const [deleted] = await db
        .delete(todos)
        .where(eq(todos.id, id))
        .returning({ id: todos.id });

    if (!deleted) {
        throw todoNotFound();
    }
}
