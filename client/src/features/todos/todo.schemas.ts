import { z } from "zod";

// ---- API response shapes ----------------------------------------------------

export const todoSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    description: z.string().nullable(),
    done: z.boolean(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export const todoResponseSchema = z.object({ data: todoSchema });
export const todoListResponseSchema = z.object({ data: z.array(todoSchema) });

export type Todo = z.infer<typeof todoSchema>;

// ---- Form input (mirrors the server's limits) -------------------------------

export const TITLE_MAX = 200;
export const DESCRIPTION_MAX = 2000;

export const todoFormSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Enter a title")
        .max(TITLE_MAX, `Use ${TITLE_MAX} characters or fewer`),
    description: z
        .string()
        .trim()
        .max(DESCRIPTION_MAX, `Use ${DESCRIPTION_MAX} characters or fewer`),
});

export type TodoFormValues = z.infer<typeof todoFormSchema>;
