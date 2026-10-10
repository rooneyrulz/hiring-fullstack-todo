import { TodoForm } from "@/features/todos/components/todo-form";
import { TodoList } from "@/features/todos/components/todo-list";

export default function App() {
    return (
        <main className="mx-auto w-full max-w-xl px-4 py-12 sm:py-20">
            <h1 className="text-2xl font-semibold tracking-tight">Todos</h1>
            <div className="mt-8">
                <TodoForm />
            </div>
            <div className="mt-10">
                <TodoList />
            </div>
        </main>
    );
}
