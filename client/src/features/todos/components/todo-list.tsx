import { getErrorMessage } from "@/lib/api-client";
import { useTodos } from "@/features/todos/todo.queries";
import { TodoItem } from "./todo-item";
import {
    TodoListEmpty,
    TodoListError,
    TodoListSkeleton,
} from "./todo-list-states";

export function TodoList() {
    const { data, isPending, error, refetch } = useTodos();

    if (isPending) return <TodoListSkeleton />;

    if (data === undefined) {
        return (
            <TodoListError
                message={getErrorMessage(error)}
                onRetry={() => void refetch()}
            />
        );
    }

    if (data.length === 0) return <TodoListEmpty />;

    return (
        <ul className="divide-y divide-border">
            {data.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
            ))}
        </ul>
    );
}
