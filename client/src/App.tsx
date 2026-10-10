import { useTodos } from "@/features/todos/todo.queries";
import { getErrorMessage } from "@/lib/api-client";

export default function App() {
    const { data, isPending, isError, error } = useTodos();

    return (
        <main className="mx-auto max-w-xl px-4 py-16">
            <h1 className="text-2xl font-semibold tracking-tight">Todos</h1>
            <p className="mt-4 text-sm text-muted-foreground">
                {isPending && "Loading…"}
                {isError && getErrorMessage(error)}
                {data && `${data.length} todos loaded from the API`}
            </p>
        </main>
    );
}
