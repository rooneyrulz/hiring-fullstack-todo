import type { RequestHandler } from "express";
import * as todoService from "./todo.service.js";

export const listTodos: RequestHandler = async (_req, res) => {
    const todos = await todoService.listTodos();
    res.json({ data: todos });
};
