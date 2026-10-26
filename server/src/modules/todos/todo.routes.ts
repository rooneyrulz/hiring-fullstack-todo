import { Router } from "express";
import * as todoController from "./todo.controller.js";
import { validate } from "../../middleware/validate.js";
import {
    createTodoSchema,
    todoIdParamsSchema,
    updateTodoSchema,
} from "./todo.schemas.js";

export const todoRouter = Router();

todoRouter.get("/", todoController.listTodos);
todoRouter.post(
    "/",
    validate({ body: createTodoSchema }),
    todoController.createTodo,
);
todoRouter.put(
    "/:id",
    validate({ params: todoIdParamsSchema, body: updateTodoSchema }),
    todoController.updateTodo,
);
todoRouter.patch(
    "/:id/done",
    validate({ params: todoIdParamsSchema }),
    todoController.toggleTodoDone,
);
todoRouter.delete(
    "/:id",
    validate({ params: todoIdParamsSchema }),
    todoController.deleteTodo,
);
