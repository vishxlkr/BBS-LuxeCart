import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import "express-async-errors";
import dotenv from "dotenv";

import connectDB from "./config/db";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { limiter, authLimiter, loginLimiter } from "./middleware/rateLimiter";

// Routes
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import cartRoutes from "./routes/cartRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS
app.use(
   cors({
      origin: [
         process.env.CLIENT_URL || "http://localhost:3000",
         "http://localhost:3001",
         "http://localhost:3002",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
   }),
);

app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (process.env.NODE_ENV === "development") {
   app.use(morgan("dev"));
}

// Health check
app.get("/health", (_req, res) => {
   res.json({
      success: true,
      message: "LuxeCart API is running",
      timestamp: new Date().toISOString(),
   });
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
   console.log(
      `🚀 LuxeCart Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
   );
});

export default app;
