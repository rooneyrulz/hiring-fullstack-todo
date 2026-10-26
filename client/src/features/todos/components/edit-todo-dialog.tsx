import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateTodo } from "@/features/todos/todo.mutations";
import {
    todoFormSchema,
    type Todo,
    type TodoFormValues,
} from "@/features/todos/todo.schemas";
import { getErrorMessage } from "@/lib/api-client";
import { TodoFields } from "./todo-fields";

export function EditTodoDialog({ todo }: Readonly<{ todo: Todo }>) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground"
                    aria-label={`Edit "${todo.title}"`}
                >
                    <Pencil aria-hidden="true" className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit todo</DialogTitle>
                    <DialogDescription className="sr-only">
                        Change the title or description of this todo.
                    </DialogDescription>
                </DialogHeader>
                <EditTodoForm todo={todo} onDone={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}

function EditTodoForm({
    todo,
    onDone,
}: Readonly<{ todo: Todo; onDone: () => void }>) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TodoFormValues>({
        resolver: zodResolver(todoFormSchema),
        defaultValues: {
            title: todo.title,
            description: todo.description ?? "",
        },
    });
    const updateTodo = useUpdateTodo();

    const onSubmit = (values: TodoFormValues) => {
        const unchanged =
            values.title === todo.title &&
            values.description === (todo.description ?? "");
        if (unchanged) {
            onDone();
            return;
        }
        updateTodo.mutate({ id: todo.id, values }, { onSuccess: onDone });
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
        >
            <TodoFields
                register={register}
                errors={errors}
                idPrefix={`edit-${todo.id}`}
                showLabels
            />

            {updateTodo.isError && (
                <p role="alert" className="text-sm text-destructive">
                    {getErrorMessage(updateTodo.error)}
                </p>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onDone}>
                    Cancel
                </Button>
                <Button type="submit" disabled={updateTodo.isPending}>
                    {updateTodo.isPending ? "Saving…" : "Save changes"}
                </Button>
            </DialogFooter>
        </form>
    );
}
