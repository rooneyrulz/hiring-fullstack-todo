import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_WIDTHS = ["w-2/3", "w-1/2", "w-3/5"];

export function TodoListSkeleton() {
    return (
        <div role="status" className="divide-y divide-border">
            <span className="sr-only">Loading todos…</span>
            {SKELETON_WIDTHS.map((width) => (
                <div
                    key={width}
                    aria-hidden="true"
                    className="flex items-start gap-3 py-3"
                >
                    <Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                        <Skeleton className={`h-5 ${width}`} />
                        <Skeleton className="mt-2 h-4 w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function TodoListEmpty() {
    return (
        <div className="py-6">
            <p className="font-medium">No todos yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
                Add your first todo to get started.
            </p>
        </div>
    );
}

interface TodoListErrorProps {
    message: string;
    onRetry: () => void;
}

export function TodoListError({ message, onRetry }: TodoListErrorProps) {
    return (
        <div role="alert" className="py-6">
            <p className="font-medium">Couldn't load your todos</p>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onRetry}
            >
                Try again
            </Button>
        </div>
    );
}
