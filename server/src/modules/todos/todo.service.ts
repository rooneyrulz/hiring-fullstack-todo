import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { todos, type Todo } from "../../db/schema.js";

export async function listTodos(): Promise<Todo[]> {
    return db.select().from(todos).orderBy(desc(todos.createdAt));
}
