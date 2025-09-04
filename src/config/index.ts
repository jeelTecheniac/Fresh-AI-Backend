import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const config = {
  // Application
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  API_VERSION: process.env.API_VERSION || "v1",

  // Database
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "5432", 10),
  DB_USERNAME: process.env.DB_USERNAME || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "fresh_ai_db",
  DB_SSL: process.env.DB_SSL === "true",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "900000",
    10
  ), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10
  ),

  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FORMAT: process.env.LOG_FORMAT || "json",

  // Email (for future use)
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",

  // File Upload (for future use)
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10), // 5MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || "./uploads",

  // Redis (for future use)
  REDIS_URL: process.env.REDIS_URL || "",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379", 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",

  // External APIs (for future use)
  EXTERNAL_API_TIMEOUT: parseInt(
    process.env.EXTERNAL_API_TIMEOUT || "10000",
    10
  ),

  // Feature Flags
  FEATURES: {
    EMAIL_VERIFICATION: process.env.ENABLE_EMAIL_VERIFICATION === "true",
    PASSWORD_RESET: process.env.ENABLE_PASSWORD_RESET === "true",
    RATE_LIMITING: process.env.ENABLE_RATE_LIMITING !== "false",
    CORS: process.env.ENABLE_CORS !== "false",
    HELMET: process.env.ENABLE_HELMET !== "false",
  },
} as const;

// Validation functions
export function validateConfig(): void {
  const requiredFields = [
    "DB_HOST",
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_NAME",
    "JWT_SECRET",
  ];

  const missingFields = requiredFields.filter(
    field => !config[field as keyof typeof config]
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingFields.join(", ")}`
    );
  }

  if (config.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  if (config.PORT < 1 || config.PORT > 65535) {
    throw new Error("PORT must be between 1 and 65535");
  }

  if (config.DB_PORT < 1 || config.DB_PORT > 65535) {
    throw new Error("DB_PORT must be between 1 and 65535");
  }

  if (config.BCRYPT_ROUNDS < 10 || config.BCRYPT_ROUNDS > 20) {
    throw new Error("BCRYPT_ROUNDS must be between 10 and 20");
  }
}

// Environment-specific configurations
export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";

// Database connection string
export const getDatabaseUrl = (): string => {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_SSL } =
    config;

  if (DB_SSL) {
    return `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require`;
  }

  return `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
};

// Export individual config sections for convenience
export const dbConfig = {
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  ssl: config.DB_SSL,
  url: getDatabaseUrl(),
};

export const jwtConfig = {
  secret: config.JWT_SECRET,
  expiresIn: config.JWT_EXPIRES_IN,
  refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
};

export const securityConfig = {
  bcryptRounds: config.BCRYPT_ROUNDS,
  rateLimit: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  },
};

export const corsConfig = {
  allowedOrigins: config.ALLOWED_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200,
};

