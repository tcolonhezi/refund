import { AppError } from "@/utils/AppError.js";
import { Request, Response, NextFunction } from "express";

class RefundsController {
  async create(request: Request, response: Response, next: NextFunction) {
    try {
      return response.json({ message: "Refund created successfully" });
    } catch (error) {
      return next(new AppError("Error creating refund", 500));
    }
  }
}

export { RefundsController };
