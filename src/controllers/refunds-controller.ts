import { RefundsWhereInput } from "./../generated/prisma/models/Refunds.js";
import { prisma } from "@/database/prisma.js";
import { Category } from "@/generated/prisma/enums.js";
import { RefundsCreateInput } from "@/generated/prisma/models.js";
import { AppError } from "@/utils/AppError.js";
import { Request, Response, NextFunction } from "express";
import z from "zod";

class RefundsController {
  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        name: z.string().trim().min(1, { message: "Name is required" }),
        category: z.enum(Category),
        amount: z
          .number()
          .positive({ message: "Amount must be a positive number" }),
        filename: z.string().trim().min(1, { message: "Filename is required" }),
      });
      const { name, category, amount, filename } = bodySchema.parse(
        request.body,
      );

      if (!request.user || !request.user.id) {
        return next(new AppError("User not authenticated", 401));
      }

      const refundInput: RefundsCreateInput = {
        name,
        category,
        amount,
        filename,
        User: {
          connect: {
            id: request.user.id,
          },
        },
      };

      const insertedRefund = await prisma.refunds.create({
        data: refundInput,
      });

      return response.json(insertedRefund);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(error);
      }
      return next(new AppError("Error creating refund", 500));
    }
  }

  async list(request: Request, response: Response, next: NextFunction) {
    try {
      const querySchema = z.object({
        name: z.string().optional(),
        page: z.coerce.number().optional().default(1),
        perPage: z.coerce.number().min(1).max(100).optional().default(1),
      });

      const { name, page, perPage } = querySchema.parse(request.query);

      const userId = request.user?.id;

      const whereInput: RefundsWhereInput = {
        userId: request.user?.role === "MANAGER" ? undefined : userId,
        ...(name && {
          OR: [
            { User: { name: name ? { contains: name } : undefined } },
            { name: name ? { contains: name } : undefined },
          ],
        }),
      };

      const totalRecords = await prisma.refunds.count({
        where: whereInput,
      });

      const totalPages = Math.ceil(totalRecords / perPage);

      const refunds = await prisma.refunds.findMany({
        where: whereInput,
        include: {
          User: {
            select: {
              name: true,
            },
          },
        },
        take: perPage,
        skip: (page - 1) * perPage,
      });

      return response.json({
        data: refunds,
        pagination: {
          totalRecords,
          page,
          perPage,
          totalPages,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(error);
      }
      return next(new AppError("Error listing refunds", 500));
    }
  }

  async show(request: Request, response: Response, next: NextFunction) {
    try {
      const paramsSchema = z.object({
        id: z.uuid(),
      });

      const { id } = paramsSchema.parse(request.params);

      const refund = await prisma.refunds.findUnique({
        where: {
          id,
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!refund) {
        return next(new AppError("Refund not found", 404));
      }

      if (
        refund.User.id !== request.user.id &&
        request.user.role !== "MANAGER"
      ) {
        return next(new AppError("Refund does not belong to your user.", 403));
      }

      return response.json(refund);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(error);
      }
      return next(new AppError("Error on show refund.", 500));
    }
  }
}

export { RefundsController };
