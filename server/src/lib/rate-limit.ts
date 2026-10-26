import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, slow down." },
});
