// src/errors.ts

export type ErrorType = "unavailable" | "not_found" | "failed" | "initialization_failed";

export type Surface = "webgpu" | "adapter" | "device" | "context" | "canvas" | "pipeline";

export type ErrorCode = `${ErrorType}:${Surface}`;

export type ErrorVisibility = "user" | "log" | "both";

/**
 * Determines error visibility based on surface
 * - "user": Show to user (display in UI)
 * - "log": Log only (don't show to user)
 * - "both": Show to user and log
 */
export const visibilityBySurface: Record<Surface, ErrorVisibility> = {
  webgpu: "user",
  adapter: "user",
  device: "log",
  context: "user",
  canvas: "user",
  pipeline: "log",
};

/**
 * Base error class for application-specific errors
 */
export class AppError extends Error {
  type: ErrorType;
  surface: Surface;
  code: ErrorCode;
  cause?: unknown;

  constructor(errorCode: ErrorCode, cause?: unknown) {
    super();

    const [type, surface] = errorCode.split(":") as [ErrorType, Surface];

    this.type = type;
    this.surface = surface;
    this.code = errorCode;
    this.cause = cause;
    this.message = getMessageByErrorCode(errorCode);
    this.name = new.target.name;

    // Fix prototype chain in TS/JS
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Get the visibility setting for this error based on its surface
   */
  getVisibility(): ErrorVisibility {
    return visibilityBySurface[this.surface];
  }

  /**
   * Check if this error should be shown to the user
   */
  shouldShowToUser(): boolean {
    const visibility = this.getVisibility();
    return visibility === "user" || visibility === "both";
  }

  /**
   * Check if this error should be logged
   */
  shouldLog(): boolean {
    const visibility = this.getVisibility();
    return visibility === "log" || visibility === "both";
  }

  /**
   * Serialize error to JSON for logging, error tracking, or API responses
   */
  toJSON(): {
    code: ErrorCode;
    message: string;
    type: ErrorType;
    surface: Surface;
    visibility: ErrorVisibility;
    cause?: unknown;
    stack?: string;
  } {
    const json: {
      code: ErrorCode;
      message: string;
      type: ErrorType;
      surface: Surface;
      visibility: ErrorVisibility;
      cause?: unknown;
      stack?: string;
    } = {
      code: this.code,
      message: this.message,
      type: this.type,
      surface: this.surface,
      visibility: this.getVisibility(),
    };

    if (this.cause) {
      json.cause = this.cause;
    }

    if (this.stack) {
      json.stack = this.stack;
    }

    return json;
  }
}

/**
 * Get user-friendly message by error code
 */
export function getMessageByErrorCode(errorCode: ErrorCode): string {
  switch (errorCode) {
    case "unavailable:webgpu":
      return "WebGPU is not available in this environment.";

    case "not_found:canvas":
      return "Canvas element not found.";

    case "not_found:adapter":
      return "No suitable GPU adapter found.";

    case "failed:device":
      return "Failed to request a GPU device.";

    case "initialization_failed:context":
      return "Failed to initialize WebGPU canvas context.";

    case "failed:pipeline":
      return "Failed to create render pipeline.";

    default:
      return "Something went wrong. Please try again later.";
  }
}

// Specific errors – easy for users to catch

/**
 * Error thrown when WebGPU is not available
 */
export class WebGPUUnavailableError extends AppError {
  constructor(cause?: unknown) {
    super("unavailable:webgpu", cause);
  }
}

/**
 * Error thrown when canvas element is not found
 */
export class CanvasNotFoundError extends AppError {
  constructor(cause?: unknown) {
    super("not_found:canvas", cause);
  }
}

/**
 * Error thrown when GPU adapter cannot be obtained
 */
export class AdapterNotFoundError extends AppError {
  constructor(cause?: unknown) {
    super("not_found:adapter", cause);
  }
}

/**
 * Error thrown when device request fails
 */
export class DeviceRequestFailedError extends AppError {
  constructor(cause?: unknown) {
    super("failed:device", cause);
  }
}

/**
 * Error thrown when WebGPU context cannot be initialized
 */
export class ContextInitFailedError extends AppError {
  constructor(cause?: unknown) {
    super("initialization_failed:context", cause);
  }
}

/**
 * Error thrown when pipeline creation fails
 */
export class PipelineCreationFailedError extends AppError {
  constructor(cause?: unknown) {
    super("failed:pipeline", cause);
  }
}
