import { DataSource } from "typeorm";
import { config, dbConfig, isDevelopment } from "./src/config/index.js";
import { User } from "./src/entities/User.js";
import { Role } from "./src/entities/Role.js";
import { Token } from "./src/entities/Token.js";
import { UserLimit } from "./src/entities/UserLimit.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  synchronize: false, // Set to false in production
  logging: isDevelopment,
  entities: [User, Role, Token, UserLimit],
  migrations: isDevelopment ? ["migrations/*.ts"] : ["dist/migrations/*.js"],
  subscribers: [],
  ssl: dbConfig.ssl,
  migrationsRun: false, // Don't run migrations automatically on startup
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },
});

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connection established successfully");

    // Log database info in development
    if (isDevelopment) {
      console.log(
        `📊 Database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`
      );
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("✅ Database connection closed successfully");
    }
  } catch (error) {
    console.error("❌ Error closing database connection:", error);
    throw error;
  }
}

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("\n🔄 Graceful shutdown initiated...");
  await closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🔄 Graceful shutdown initiated...");
  await closeDatabase();
  process.exit(0);
});
