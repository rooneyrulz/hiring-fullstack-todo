import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTodo } from "@/features/todos/todo.mutations";
import {
    todoFormSchema,
    type TodoFormValues,
} from "@/features/todos/todo.schemas";
import { getErrorMessage } from "@/lib/api-client";

export function TodoForm() {
    const {
        register,
        handleSubmit,
        resetField,
        setFocus,
        formState: { errors },
    } = useForm<TodoFormValues>({
        resolver: zodResolver(todoFormSchema),
        defaultValues: { title: "", description: "" },
    });
    const createTodo = useCreateTodo();

    const onSubmit = (values: TodoFormValues) => {
        createTodo.mutate(values, {
            onSuccess: () => {
                resetField("title");
                resetField("description");
                setFocus("title");
            },
        });
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-3"
        >
            <div>
                <label htmlFor="todo-title" className="sr-only">
                    Title
                </label>
                <Input
                    id="todo-title"
                    placeholder="What needs doing?"
                    autoComplete="off"
                    aria-invalid={errors.title ? true : undefined}
                    aria-describedby={
                        errors.title ? "todo-title-error" : undefined
                    }
                    {...register("title")}
                />
                {errors.title && (
                    <p
                        id="todo-title-error"
                        role="alert"
                        className="mt-1.5 text-sm text-destructive"
                    >
                        {errors.title.message}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="todo-description" className="sr-only">
                    Description (optional)
                </label>
                <Textarea
                    id="todo-description"
                    rows={2}
                    placeholder="Description (optional)"
                    aria-invalid={errors.description ? true : undefined}
                    aria-describedby={
                        errors.description
                            ? "todo-description-error"
                            : undefined
                    }
                    {...register("description")}
                />
                {errors.description && (
                    <p
                        id="todo-description-error"
                        role="alert"
                        className="mt-1.5 text-sm text-destructive"
                    >
                        {errors.description.message}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3">
                {createTodo.isError && (
                    <p role="alert" className="text-sm text-destructive">
                        {getErrorMessage(createTodo.error)}
                    </p>
                )}
                <Button
                    type="submit"
                    className="ml-auto"
                    disabled={createTodo.isPending}
                >
                    {createTodo.isPending ? "Adding…" : "Add todo"}
                </Button>
            </div>
        </form>
    );
}
