import { Router } from "express";
import * as todoController from "./todo.controller.js";
import { validate } from "../../middleware/validate.js";
import { createTodoSchema } from "./todo.schemas.js";

export const todoRouter = Router();

todoRouter.get("/", todoController.listTodos);
todoRouter.post(
    "/",
    validate({ body: createTodoSchema }),
    todoController.createTodo,
);
