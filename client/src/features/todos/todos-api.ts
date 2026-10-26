import { request } from "@/lib/api-client";
import {
    todoListResponseSchema,
    todoResponseSchema,
    type Todo,
    type TodoFormValues,
} from "./todo.schemas";

export async function listTodos(signal?: AbortSignal): Promise<Todo[]> {
    const { data } = await request("/api/todos", {
        schema: todoListResponseSchema,
        signal,
    });
    return data;
}

export async function createTodo(values: TodoFormValues): Promise<Todo> {
    const { data } = await request("/api/todos", {
        method: "POST",
        body: values,
        schema: todoResponseSchema,
    });
    return data;
}

export async function updateTodo(
    id: string,
    values: TodoFormValues,
): Promise<Todo> {
    const { data } = await request(`/api/todos/${id}`, {
        method: "PUT",
        body: values,
        schema: todoResponseSchema,
    });
    return data;
}

export async function toggleTodoDone(id: string): Promise<Todo> {
    const { data } = await request(`/api/todos/${id}/done`, {
        method: "PATCH",
        schema: todoResponseSchema,
    });
    return data;
}

export async function deleteTodo(id: string): Promise<void> {
    await request(`/api/todos/${id}`, { method: "DELETE" });
}
