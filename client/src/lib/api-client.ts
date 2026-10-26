import { z } from "zod";
import { env } from "@/lib/env";

const errorBodySchema = z.object({
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z
            .array(z.object({ field: z.string(), message: z.string() }))
            .optional(),
    }),
});

type ErrorDetails = z.infer<typeof errorBodySchema>["error"]["details"];

export class ApiError extends Error {
    readonly status: number;
    readonly code: string;
    readonly details: ErrorDetails;

    constructor(
        status: number,
        code: string,
        message: string,
        details?: ErrorDetails,
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

interface RequestOptions<T> {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    schema?: z.ZodType<T>;
    signal?: AbortSignal;
}

async function toApiError(response: Response): Promise<ApiError> {
    const json: unknown = await response.json().catch(() => undefined);
    const parsed = errorBodySchema.safeParse(json);

    if (parsed.success) {
        const { code, message, details } = parsed.data.error;
        return new ApiError(response.status, code, message, details);
    }
    return new ApiError(
        response.status,
        "UNKNOWN_ERROR",
        "Something went wrong. Please try again.",
    );
}

export async function request<T = void>(
    path: string,
    { method = "GET", body, schema, signal }: RequestOptions<T> = {},
): Promise<T> {
    let response: Response;

    try {
        response = await fetch(`${env.VITE_API_URL}${path}`, {
            method,
            headers:
                body !== undefined
                    ? { "Content-Type": "application/json" }
                    : undefined,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal,
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
            throw error;
        throw new ApiError(
            0,
            "NETWORK_ERROR",
            "Can't reach the server. Check your connection and try again.",
        );
    }

    if (!response.ok) throw await toApiError(response);
    if (response.status === 204 || !schema) return undefined as T;

    const json: unknown = await response.json().catch(() => undefined);
    const parsed = schema.safeParse(json);

    if (!parsed.success) {
        throw new ApiError(
            response.status,
            "INVALID_RESPONSE",
            "The server sent an unexpected response.",
        );
    }
    return parsed.data;
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return error.details?.length
            ? error.details.map((d) => d.message).join(" ")
            : error.message;
    }
    return "Something went wrong. Please try again.";
}
