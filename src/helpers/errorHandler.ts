import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

// Success Middleware: Attach success:true to successful responses
export const successMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (this: Response, body: any): Response {
    // If there's no success field in the body, add it with success: true
    if (body && !body.success) {
      body.success = true;
    }
    return originalJson.call(this, body);
  };

  next();
};
// handle not found errors
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND);
  res.json({
    success: false,
    message: "Requested Resource Not Found",
  });
  res.end();
};

// handle internal server errors
export const internalServerError = (err, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR);
  res.json({
    success: false,
    message: err.message,
    extra: err.extra, // Only include extra if it's available
    errors: err.error || {}, // Only include 'errors' if it exists
  });
  res.end();
};
