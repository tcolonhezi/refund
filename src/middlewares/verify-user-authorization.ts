import { UserRole } from "@/generated/prisma/enums.js";
import { AppError } from "@/utils/AppError.js";
import { NextFunction, Request, Response } from "express";

function verifyUserAuthorization(requiredPermissions: UserRole[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
      return next(new AppError("User not authenticated", 401));
    }

    const hasPermission = requiredPermissions.includes(request.user.role);
    if (!hasPermission) {
      return next(new AppError("User not authorized", 403));
    }
    return next();
  };
}

export { verifyUserAuthorization };
