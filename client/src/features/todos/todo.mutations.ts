import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-client";
import { todoKeys } from "./todo.queries";
import type { Todo, TodoFormValues } from "./todo.schemas";
import { createTodo, updateTodo } from "./todos-api";

export function useCreateTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTodo,
        onSuccess: (todo) => {
            queryClient.setQueryData<Todo[]>(todoKeys.all, (todos) =>
                todos ? [todo, ...todos] : todos,
            );
        },
    });
}

export function useUpdateTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, values }: { id: string; values: TodoFormValues }) =>
            updateTodo(id, values),
        onSuccess: (updated) => {
            queryClient.setQueryData<Todo[]>(todoKeys.all, (todos) =>
                todos?.map((todo) => (todo.id === updated.id ? updated : todo)),
            );
        },
        onError: (error) => {
            if (error instanceof ApiError && error.status === 404) {
                void queryClient.invalidateQueries({ queryKey: todoKeys.all });
            }
        },
    });
}
