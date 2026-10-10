import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-client";
import { todoKeys } from "./todo.queries";
import type { Todo, TodoFormValues } from "./todo.schemas";
import { createTodo, updateTodo, toggleTodoDone } from "./todos-api";

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

const toggleMutationKey = ["todos", "toggle"] as const;

export function useToggleTodo() {
    const queryClient = useQueryClient();

    const setDone = (id: string, done: boolean) =>
        queryClient.setQueryData<Todo[]>(todoKeys.all, (todos) =>
            todos?.map((todo) => (todo.id === id ? { ...todo, done } : todo)),
        );

    return useMutation({
        mutationKey: toggleMutationKey,
        mutationFn: toggleTodoDone,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: todoKeys.all });

            const previous = queryClient
                .getQueryData<Todo[]>(todoKeys.all)
                ?.find((todo) => todo.id === id);
            if (previous) setDone(id, !previous.done);

            return { previousDone: previous?.done };
        },
        onError: (_error, id, context) => {
            if (context?.previousDone !== undefined)
                setDone(id, context.previousDone);
        },
        onSettled: () => {
            if (
                queryClient.isMutating({ mutationKey: toggleMutationKey }) === 1
            ) {
                void queryClient.invalidateQueries({ queryKey: todoKeys.all });
            }
        },
    });
}
