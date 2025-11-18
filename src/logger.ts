// src/logger.ts

import { AppError } from "./errors";

const isDevelopment = import.meta.env.DEV;

/**
 * Logger utility for development
 * Provides structured error logging with context information
 */

/**
 * Logs an error with structured information
 */
export function error(error: Error | AppError, context?: Record<string, unknown>): void {
  if (!isDevelopment) {
    return;
  }

  const timestamp = new Date().toISOString();
  const errorInfo: Record<string, unknown> = {
    timestamp,
    name: error.name,
    message: error.message,
    stack: error.stack,
  };

  // Add additional context if it's an AppError
  if (error instanceof AppError) {
    errorInfo.code = error.code;
    if (error.cause) {
      errorInfo.cause = error.cause;
    }
  }

  // Merge any additional context passed to the logger
  if (context) {
    errorInfo.additionalContext = context;
  }

  console.group(`%c[ERROR] ${error.name}`, "color: red; font-weight: bold;");
  console.error("Message:", error.message);

  if (error instanceof AppError) {
    console.error("Code:", error.code);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }

  if (error.stack) {
    console.error("Stack:", error.stack);
  }

  if (context) {
    console.error("Additional Context:", context);
  }

  console.error("Full Error Object:", errorInfo);
  console.groupEnd();
}

/**
 * Logs a warning message
 */
export function warn(message: string, context?: Record<string, unknown>): void {
  if (!isDevelopment) {
    return;
  }

  console.warn(`[WARN] ${message}`, context || "");
}

/**
 * Logs an info message
 */
export function info(message: string, context?: Record<string, unknown>): void {
  if (!isDevelopment) {
    return;
  }

  console.info(`[INFO] ${message}`, context || "");
}

/**
 * Logs a debug message
 */
export function debug(message: string, context?: Record<string, unknown>): void {
  if (!isDevelopment) {
    return;
  }

  console.debug(`[DEBUG] ${message}`, context || "");
}
