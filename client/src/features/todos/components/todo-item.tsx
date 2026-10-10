import { Checkbox } from "@/components/ui/checkbox";
import { useToggleTodo } from "@/features/todos/todo.mutations";
import type { Todo } from "@/features/todos/todo.schemas";
import { getErrorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { EditTodoDialog } from "./edit-todo-dialog";

export function TodoItem({ todo }: Readonly<{ todo: Todo }>) {
    const toggle = useToggleTodo();
    const titleId = `todo-title-${todo.id}`;

    const handleToggle = () => {
        if (!toggle.isPending) toggle.mutate(todo.id);
    };
    return (
        <li className="flex items-start gap-3 py-3">
            <Checkbox
                checked={todo.done}
                onCheckedChange={handleToggle}
                aria-labelledby={titleId}
                aria-busy={toggle.isPending || undefined}
                className="mt-0.5 size-5 rounded-full transition-colors data-[state=checked]:border-teal-700 data-[state=checked]:bg-teal-700 data-[state=checked]:text-white"
            />
            <div className="min-w-0 flex-1">
                <p
                    id={titleId}
                    className={cn(
                        "font-medium break-words transition-colors",
                        todo.done && "text-muted-foreground line-through",
                    )}
                >
                    {todo.title}
                </p>
                {todo.description && (
                    <p
                        className={cn(
                            "mt-1 text-sm break-words whitespace-pre-wrap text-muted-foreground transition-colors",
                            todo.done && "line-through",
                        )}
                    >
                        {todo.description}
                    </p>
                )}
                {toggle.isError && (
                    <p role="alert" className="mt-1 text-sm text-destructive">
                        {getErrorMessage(toggle.error)}
                    </p>
                )}
            </div>

            <EditTodoDialog todo={todo} />
        </li>
    );
}
