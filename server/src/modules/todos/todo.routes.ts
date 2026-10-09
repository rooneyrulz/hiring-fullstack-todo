import { Router } from "express";
import * as todoController from "./todo.controller.js";

export const todoRouter = Router();

todoRouter.get("/", todoController.listTodos);
