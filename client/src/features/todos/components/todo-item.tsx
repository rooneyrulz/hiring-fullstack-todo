import type { Todo } from "@/features/todos/todo.schemas";
import { cn } from "@/lib/utils";
import { EditTodoDialog } from "./edit-todo-dialog";

export function TodoItem({ todo }: Readonly<{ todo: Todo }>) {
    return (
        <li className="flex items-start gap-3 py-3">
            <div className="min-w-0 flex-1">
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
            </div>

            <EditTodoDialog todo={todo} />
        </li>
    );
}
