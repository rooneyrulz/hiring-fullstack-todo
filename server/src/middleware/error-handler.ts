import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";

interface ErrorBody {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}

function hasType(err: unknown, type: string): boolean {
    return (
        typeof err === "object" &&
        err !== null &&
        "type" in err &&
        err.type === type
    );
}

function formatZodIssues(error: ZodError) {
    return error.issues.map((issue) => {
        const isRootTypeError =
            issue.path.length === 0 && issue.code === "invalid_type";
        return {
            field: issue.path.length > 0 ? issue.path.join(".") : "body",
            message: isRootTypeError
                ? "Request body must be a JSON object"
                : issue.message,
        };
    });
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (res.headersSent) {
        next(err);
        return;
    }

    let status = 500;
    let body: ErrorBody = {
        error: {
            code: "INTERNAL_ERROR",
            message: "Something went wrong. Please try again later.",
        },
    };

    if (err instanceof AppError) {
        status = err.statusCode;
        body = {
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
        };
    } else if (err instanceof ZodError) {
        status = 400;
        body = {
            error: {
                code: "VALIDATION_ERROR",
                message: "Validation failed",
                details: formatZodIssues(err),
            },
        };
    } else if (hasType(err, "entity.parse.failed")) {
        status = 400;
        body = {
            error: {
                code: "INVALID_JSON",
                message: "Request body contains invalid JSON",
            },
        };
    } else if (hasType(err, "entity.too.large")) {
        status = 413;
        body = {
            error: {
                code: "PAYLOAD_TOO_LARGE",
                message: "Request body is too large",
            },
        };
    }

    if (status >= 500) {
        req.log.error({ err }, "Unhandled error");
    }

    res.status(status).json(body);
};
