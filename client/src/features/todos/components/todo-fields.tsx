import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TodoFormValues } from "@/features/todos/todo.schemas";
import { cn } from "@/lib/utils";

interface TodoFieldsProps {
    register: UseFormRegister<TodoFormValues>;
    errors: FieldErrors<TodoFormValues>;
    idPrefix: string;
    showLabels?: boolean;
}

export function TodoFields({
    register,
    errors,
    idPrefix,
    showLabels = false,
}: Readonly<TodoFieldsProps>) {
    const titleId = `${idPrefix}-title`;
    const descriptionId = `${idPrefix}-description`;
    const labelClass = cn(
        showLabels ? "mb-1.5 block text-sm font-medium" : "sr-only",
    );

    return (
        <>
            <div>
                <label htmlFor={titleId} className={labelClass}>
                    Title
                </label>
                <Input
                    id={titleId}
                    placeholder="What needs doing?"
                    autoComplete="off"
                    aria-invalid={errors.title ? true : undefined}
                    aria-describedby={
                        errors.title ? `${titleId}-error` : undefined
                    }
                    {...register("title")}
                />
                {errors.title && (
                    <p
                        id={`${titleId}-error`}
                        role="alert"
                        className="mt-1.5 text-sm text-destructive"
                    >
                        {errors.title.message}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor={descriptionId} className={labelClass}>
                    Description (optional)
                </label>
                <Textarea
                    id={descriptionId}
                    rows={2}
                    placeholder="Description (optional)"
                    aria-invalid={errors.description ? true : undefined}
                    aria-describedby={
                        errors.description
                            ? `${descriptionId}-error`
                            : undefined
                    }
                    {...register("description")}
                />
                {errors.description && (
                    <p
                        id={`${descriptionId}-error`}
                        role="alert"
                        className="mt-1.5 text-sm text-destructive"
                    >
                        {errors.description.message}
                    </p>
                )}
            </div>
        </>
    );
}
