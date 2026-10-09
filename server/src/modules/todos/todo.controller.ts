import type { RequestHandler } from "express";
import type { CreateTodoInput } from "./todo.schemas.js";
import * as todoService from "./todo.service.js";

export const listTodos: RequestHandler = async (_req, res) => {
    const todos = await todoService.listTodos();
    res.json({ data: todos });
};

export const createTodo: RequestHandler<
    unknown,
    unknown,
    CreateTodoInput
> = async (req, res) => {
    const todo = await todoService.createTodo(req.body);
    res.status(201).json({ data: todo });
};
