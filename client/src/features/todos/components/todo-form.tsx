import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useCreateTodo } from "@/features/todos/todo.mutations";
import {
    todoFormSchema,
    type TodoFormValues,
} from "@/features/todos/todo.schemas";
import { getErrorMessage } from "@/lib/api-client";
import { TodoFields } from "./todo-fields";

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
            <TodoFields register={register} errors={errors} idPrefix="todo" />

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
