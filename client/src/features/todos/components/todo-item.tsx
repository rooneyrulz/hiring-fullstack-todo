import type { Todo } from "@/features/todos/todo.schemas";
import { cn } from "@/lib/utils";

export function TodoItem({ todo }: { todo: Todo }) {
    return (
        <li className="py-3">
            <p
                className={cn(
                    "font-medium break-words",
                    todo.done && "text-muted-foreground line-through",
                )}
            >
                {todo.title}
            </p>
            {todo.description && (
                <p
                    className={cn(
                        "mt-1 text-sm break-words whitespace-pre-wrap text-muted-foreground",
                        todo.done && "line-through",
                    )}
                >
                    {todo.description}
                </p>
            )}
        </li>
    );
}
