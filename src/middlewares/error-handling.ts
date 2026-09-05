import { AppError } from "@/utils/AppError.js";
import { ErrorRequestHandler } from "express";
import z, { ZodError } from "zod";

export const errorHandling: ErrorRequestHandler = (
  error,
  request,
  response,
  next,
) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Validation failed",
      errors: z.treeifyError(error),
    });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({
      message: "Invalid JSON",
    });
  }

  console.error(error);

  return response.status(500).json({
    message: "Internal server error",
  });
};
