import { authConfig } from "@/configs/auth.js";
import { AppError } from "@/utils/AppError.js";
import { NextFunction, Request, Response } from "express";
import { UserRole } from "@/generated/prisma/client.js";
import z from "zod";
import jwt from "jsonwebtoken";

interface TokenPayload {
  role: UserRole;
  sub: string;
}

function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const authSchema = z.object({
      authorization: z
        .string()
        .startsWith("Bearer ", { message: "Invalid token format" }),
    });

    const { authorization } = authSchema.parse(request.headers);

    const token = authorization.split(" ")[1];
    const { sub, role } = jwt.verify(
      token,
      authConfig.jwt.secret,
    ) as TokenPayload;

    request.user = { id: sub, role };
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(error);
    }
    return next(new AppError("Invalid token", 401));
  }
}

export { ensureAuthenticated };
