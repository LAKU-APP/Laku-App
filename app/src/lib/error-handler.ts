import { AxiosError } from 'axios';
import { ZodError } from 'zod';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, string[]>;
}

/**
 * Parse error from various sources (API, Zod, etc)
 */
export function parseError(error: unknown): ApiError {
  // Axios error
  if (error instanceof AxiosError) {
    return {
      message: error.response?.data?.message || error.message || 'Terjadi kesalahan',
      status: error.response?.status,
      code: error.code,
      details: error.response?.data?.errors,
    };
  }

  // Zod validation error
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!details[path]) details[path] = [];
      details[path].push(err.message);
    });
    return {
      message: 'Validasi data gagal',
      details,
    };
  }

  // Generic Error
  if (error instanceof Error) {
    return {
      message: error.message || 'Terjadi kesalahan tidak diketahui',
    };
  }

  return {
    message: 'Terjadi kesalahan tidak diketahui',
  };
}

/**
 * Get first error message (for toast notifications)
 */
export function getErrorMessage(error: unknown): string {
  const parsed = parseError(error);
  if (parsed.details) {
    const firstField = Object.keys(parsed.details)[0];
    return parsed.details[firstField]?.[0] || parsed.message;
  }
  return parsed.message;
}

/**
 * Get all error messages (for multiple field errors)
 */
export function getErrorMessages(error: unknown): Record<string, string> {
  const parsed = parseError(error);
  const messages: Record<string, string> = {};
  
  if (parsed.details) {
    Object.entries(parsed.details).forEach(([field, msgs]) => {
      messages[field] = msgs[0] || 'Error';
    });
  }
  
  return messages;
}
