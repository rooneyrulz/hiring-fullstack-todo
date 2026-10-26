import { z } from "zod";

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 2000;

const title = z
    .string({
        error: (issue) =>
            issue.input === undefined
                ? "Title is required"
                : "Title must be a string",
    })
    .trim()
    .min(1, "Title is required")
    .max(TITLE_MAX, `Title must be at most ${TITLE_MAX} characters`);

const description = z
    .string("Description must be a string")
    .trim()
    .max(
        DESCRIPTION_MAX,
        `Description must be at most ${DESCRIPTION_MAX} characters`,
    )
    .transform((value) => (value === "" ? null : value))
    .nullish();

export const todoIdParamsSchema = z.object({
    id: z.uuid("Invalid todo id"),
});

export const createTodoSchema = z.object({
    title,
    description,
});

export const updateTodoSchema = z
    .object({
        title: title.optional(),
        description,
    })
    .refine(
        (data) => data.title !== undefined || data.description !== undefined,
        {
            message: "Provide at least one of: title, description",
        },
    );

export type TodoIdParams = z.infer<typeof todoIdParamsSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
