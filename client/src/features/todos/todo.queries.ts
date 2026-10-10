import { queryOptions, useQuery } from "@tanstack/react-query";
import { listTodos } from "./todos-api";

export const todoKeys = {
    all: ["todos"] as const,
};

export const todosQueryOptions = queryOptions({
    queryKey: todoKeys.all,
    queryFn: ({ signal }) => listTodos(signal),
});

export function useTodos() {
    return useQuery(todosQueryOptions);
}
