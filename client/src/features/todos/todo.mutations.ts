import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todoKeys } from "./todo.queries";
import type { Todo } from "./todo.schemas";
import { createTodo } from "./todos-api";

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
