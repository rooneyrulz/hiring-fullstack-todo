import {
    useMutation,
    useQueryClient,
    type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, getErrorMessage } from "@/lib/api-client";
import { todoKeys } from "./todo.queries";
import type { Todo, TodoFormValues } from "./todo.schemas";
import {
    createTodo,
    deleteTodo,
    updateTodo,
    toggleTodoDone,
} from "./todos-api";

const toggleMutationKey = ["todos", "toggle"] as const;
const deleteMutationKey = ["todos", "delete"] as const;

function resyncWhenIdle(queryClient: QueryClient) {
    if (queryClient.isMutating({ mutationKey: ["todos"] }) === 1) {
        void queryClient.invalidateQueries({ queryKey: todoKeys.all });
    }
}

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
        onSettled: () => resyncWhenIdle(queryClient),
    });
}

export function useDeleteTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: deleteMutationKey,
        mutationFn: async (id: string) => {
            try {
                await deleteTodo(id);
            } catch (error) {
                if (!(error instanceof ApiError && error.status === 404))
                    throw error;
            }
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: todoKeys.all });

            const todos = queryClient.getQueryData<Todo[]>(todoKeys.all);
            const index = todos?.findIndex((todo) => todo.id === id) ?? -1;
            const removed = index >= 0 ? todos?.[index] : undefined;

            if (todos && removed) {
                queryClient.setQueryData<Todo[]>(
                    todoKeys.all,
                    todos.filter((todo) => todo.id !== id),
                );
            }
            return { removed, index };
        },
        onError: (error, _id, context) => {
            const removed = context?.removed;
            if (removed) {
                queryClient.setQueryData<Todo[]>(todoKeys.all, (todos) => {
                    if (!todos || todos.some((todo) => todo.id === removed.id))
                        return todos;
                    const restored = [...todos];
                    restored.splice(
                        Math.min(context.index, restored.length),
                        0,
                        removed,
                    );
                    return restored;
                });
            }
            toast.error("Couldn't delete the todo", {
                description: getErrorMessage(error),
            });
        },
        onSettled: () => resyncWhenIdle(queryClient),
    });
}
