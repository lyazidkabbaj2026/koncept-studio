import { toast } from 'sonner'
import { APP_CONFIG } from '@/constants/config'

/**
 * Centralized error handling utility
 * Provides consistent error handling and user feedback across the application
 */

export interface ErrorContext {
  context?: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
  repository?: string;
  service?: string;
  table?: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handles errors consistently across the application
 * @param error - The error to handle
 * @param context - Additional context for the error
 * @param showToast - Whether to show a toast notification
 */
export function handleError(
  error: unknown,
  context?: ErrorContext,
  showToast = true
): void {
  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', {
      error,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Determine user-friendly message
  let userMessage: string = APP_CONFIG.ERRORS.GENERIC;

  if (error instanceof AppError) {
    userMessage = error.message;
  } else if (error instanceof Error) {
    // Map common error patterns to user-friendly messages
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      userMessage = APP_CONFIG.ERRORS.NETWORK;
    } else if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      userMessage = APP_CONFIG.ERRORS.UNAUTHORIZED;
    } else if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
      userMessage = APP_CONFIG.ERRORS.FORBIDDEN;
    } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      userMessage = APP_CONFIG.ERRORS.NOT_FOUND;
    } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      userMessage = APP_CONFIG.ERRORS.VALIDATION;
    }
  }

  // Show toast notification if requested
  if (showToast) {
    toast.error(userMessage);
  }
}

/**
 * Wraps an async function with error handling
 * @param fn - The async function to wrap
 * @param context - Error context
 * @returns Wrapped function with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: ErrorContext
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };
}

/**
 * Creates a result wrapper that includes success/error state
 * Useful for functions that need to return both data and error information
 */
export type Result<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  code?: string;
};

export function createResult<T>(data: T): Result<T>;
export function createResult<T>(error: string, code?: string): Result<T>;
export function createResult<T>(dataOrError: T | string, code?: string): Result<T> {
  if (typeof dataOrError === 'string') {
    return { success: false, error: dataOrError, code };
  }
  return { success: true, data: dataOrError };
}

/**
 * Safely executes a function and returns a Result
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<Result<T>> {
  try {
    const data = await fn();
    return createResult(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : APP_CONFIG.ERRORS.GENERIC;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Safe execute error:', { error, context });
    }

    return createResult<T>(errorMessage);
  }
}