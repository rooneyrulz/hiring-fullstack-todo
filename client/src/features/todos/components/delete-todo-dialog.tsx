import { Trash2 } from "lucide-react";
import { useRef } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { focusNewTodoField } from "@/features/todos/todo-focus";
import { useDeleteTodo } from "@/features/todos/todo.mutations";
import type { Todo } from "@/features/todos/todo.schemas";

export function DeleteTodoDialog({ todo }: { todo: Todo }) {
    const deleteTodo = useDeleteTodo();
    const confirmedRef = useRef(false);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete "${todo.title}"`}
                >
                    <Trash2 aria-hidden="true" className="size-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
                onCloseAutoFocus={(event) => {
                    if (confirmedRef.current) {
                        event.preventDefault();
                        focusNewTodoField();
                    }
                }}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this todo?</AlertDialogTitle>
                    <AlertDialogDescription className="break-words">
                        “{todo.title}” will be permanently deleted. This can’t
                        be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={() => {
                            confirmedRef.current = true;
                            deleteTodo.mutate(todo.id);
                        }}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
