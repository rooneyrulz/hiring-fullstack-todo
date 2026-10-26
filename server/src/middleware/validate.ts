import type { RequestHandler } from "express";
import type { ZodType } from "zod";

interface RequestSchemas {
    body?: ZodType;
    params?: ZodType;
}

export function validate(schemas: RequestSchemas): RequestHandler {
    return (req, _res, next) => {
        if (schemas.params) {
            req.params = schemas.params.parse(req.params) as typeof req.params;
        }
        if (schemas.body) {
            req.body = schemas.body.parse(req.body);
        }
        next();
    };
}
