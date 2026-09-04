import { authConfig } from "@/configs/auth.js";
import { prisma } from "@/database/prisma.js";
import { AppError } from "@/utils/AppError.js";
import { compare } from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import z from "zod";

class SessionsController {
  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string(),
      });

      const { email, password } = bodySchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return next(new AppError("Invalid email or password", 401));
      }

      const isPasswordValid = await compare(password, user.password);

      if (!isPasswordValid) {
        return next(new AppError("Invalid email or password", 401));
      }

      const { secret, expiresIn } = authConfig.jwt;

      const token = jwt.sign({ role: user.role }, secret, {
        subject: String(user.id),
        expiresIn,
      });

      const { password: _, ...userWithoutPassword } = user;

      return response.json({ token, user: userWithoutPassword });
    } catch (error) {
      return next(new AppError("Error creating session", 500));
    }
  }
}

export { SessionsController };
