// Anything that is NOT an AppError is treated as an unexpected 500.

export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly code: string,
        message: string,
        public readonly details?: unknown,
    ) {
        super(message);
        this.name = "AppError";
    }
}
