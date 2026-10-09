import type { RequestHandler } from "express";
import type {
    CreateTodoInput,
    TodoIdParams,
    UpdateTodoInput,
} from "./todo.schemas.js";
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

export const updateTodo: RequestHandler<
    TodoIdParams,
    unknown,
    UpdateTodoInput
> = async (req, res) => {
    const todo = await todoService.updateTodo(req.params.id, req.body);
    res.json({ data: todo });
};

export const toggleTodoDone: RequestHandler<TodoIdParams> = async (
    req,
    res,
) => {
    const todo = await todoService.toggleTodoDone(req.params.id);
    res.json({ data: todo });
};

export const deleteTodo: RequestHandler<TodoIdParams> = async (req, res) => {
    await todoService.deleteTodo(req.params.id);
    res.status(204).end();
};
