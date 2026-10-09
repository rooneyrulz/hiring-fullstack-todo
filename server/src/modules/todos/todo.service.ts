import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { todos, type Todo } from "../../db/schema.js";
import type { CreateTodoInput } from "./todo.schemas.js";

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
