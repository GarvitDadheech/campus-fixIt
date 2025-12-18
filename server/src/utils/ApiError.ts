export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: any[];

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: any[],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Factory methods for common errors
  static badRequest(message: string, errors?: any[]): ApiError {
    return new ApiError(400, message, true, errors);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static tooManyRequests(message: string = 'Too many requests'): ApiError {
    return new ApiError(429, message);
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(500, message, false);
  }
}

export default ApiError;

