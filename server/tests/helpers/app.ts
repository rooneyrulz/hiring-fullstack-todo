import request from "supertest";
import { createApp } from "../../src/app.js";

const app = createApp();

/** A supertest client bound to the real Express app (no network port needed). */
export const api = () => request(app);
