import "reflect-metadata";
import dotenv from "dotenv";
import app from "./app.js";
import { initializeDatabase } from "../data-source.js";
import { logger } from "./utils/logger.js";

// Load environment variables first
dotenv.config();

console.log(process.env.DB_PORT, "db port");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

async function startServer(): Promise<void> {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Start the server
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/`);
      logger.info(`🔌 API endpoints: http://localhost:${PORT}/api/`);
    });

    // Graceful shutdown handling
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully");
      process.exit(0);
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received, shutting down gracefully");
      process.exit(0);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", error => {
  logger.error(`Uncaught Exception: ${error}`);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Start the server
startServer();
