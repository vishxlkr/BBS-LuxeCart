import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100,
   message: {
      success: false,
      message: "Too many requests, please try again later.",
   },
   skip: (req) => process.env.NODE_ENV === "development",
});

export const authLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: process.env.NODE_ENV === "development" ? 1000 : 50,
   message: {
      success: false,
      message: "Too many authentication attempts, please try again later.",
   },
   skip: (req) => process.env.NODE_ENV === "development",
   keyGenerator: (req) => req.ip || "unknown",
});

export const loginLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: process.env.NODE_ENV === "development" ? 1000 : 10,
   message: {
      success: false,
      message: "Too many login attempts, please try again later.",
   },
   skip: (req) => process.env.NODE_ENV === "development",
   keyGenerator: (req) => {
      const email = req.body?.email || "unknown";
      return `${req.ip}-${email}`;
   },
});
