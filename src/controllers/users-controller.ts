import { NextFunction, Request, Response } from "express";
import { UserRole } from "@/generated/prisma/enums.js";
import z from "zod";
import { UserCreateInput } from "@/generated/prisma/models.js";
import { prisma } from "@/database/prisma.js";
import { hash } from "bcrypt";
import { AppError } from "@/utils/AppError.js";
class UserController {
  async createUser(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        name: z
          .string()
          .min(3, { message: "Name must be at least 3 characters long" }),
        email: z.email({ message: "Invalid email address" }),
        password: z
          .string()
          .min(6, { message: "Password must be at least 6 characters long" }),
        role: z
          .enum(UserRole, { message: "Invalid role" })
          .default(UserRole.EMPLOYEE),
      });

      const { name, email, password, role } = bodySchema.parse(request.body);

      const hasUserWithEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (hasUserWithEmail) {
        return new AppError("Email already exists", 409);
      }

      const passwordHashed = await hash(password, 10);

      const userInput: UserCreateInput = {
        name,
        email,
        role,
        password: passwordHashed,
      };

      const user = await prisma.user.create({
        data: userInput,
      });

      const { password: _, ...userWithoutPassword } = user;

      return response.json(userWithoutPassword);
    } catch (error) {
      return next(error);
    }
  }
}

export { UserController };
