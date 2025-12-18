import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Async handler wrapper to catch errors in async route handlers
 * This eliminates the need for try-catch blocks in every controller
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;

