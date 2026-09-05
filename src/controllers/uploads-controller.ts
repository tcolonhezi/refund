import { NextFunction, Request, Response } from "express";

import uploadConfig from "@/configs/upload.js";
import z from "zod";
import { AppError } from "@/utils/AppError.js";
import { DiskStorage } from "@/providers/disk-storage.js";
import { prisma } from "@/database/prisma.js";
import path from "node:path";

class UploadsController {
  async create(request: Request, response: Response, next: NextFunction) {
    const diskStorage = new DiskStorage();
    try {
      const fileSchema = z
        .object({
          filename: z
            .string()
            .min(1, "File not found.")
            .regex(/^[^\/\\]+$/, "File name contains invalid characters."),
          mimetype: z
            .string()
            .refine(
              (type) => uploadConfig.ACCEPTED_IMAGE_TYPES.includes(type),
              `Invalid file format. Format allowed: ${uploadConfig.ACCEPTED_IMAGE_TYPES}`,
            ),
          size: z
            .number()
            .positive()
            .refine(
              (size) => size <= uploadConfig.MAX_FILE_SIZE,
              `File size exceeds: ${uploadConfig.MAX_SIZE} MB `,
            ),
        })
        .loose();

      const file = fileSchema.parse(request.file);
      const fileUploaded = await diskStorage.saveFile(file.filename);

      response.json(fileUploaded);
    } catch (error) {
      if (error instanceof z.ZodError) {
        if (request.file) {
          try {
            await diskStorage.deleteFile(request.file.filename, "tmp");
          } catch (cleanupError) {
            console.error("Failed to cleanup tmp file:", cleanupError);
          }
        }
      }
      return next(error);
    }
  }

  async show(request: Request, response: Response, next: NextFunction) {
    try {
      const paramsSchema = z.object({
        filename: z.string().min(1, "File not found."),
      });
      const { filename } = paramsSchema.parse(request.params);
      const refund = await prisma.refunds.findFirst({
        where: { filename: filename },
      });

      if (!refund) return next(new AppError("File not found", 404));

      if (
        refund.userId !== request.user.id &&
        request.user.role !== "MANAGER"
      ) {
        return next(new AppError("Access denied", 403));
      }

      return response.sendFile(
        path.resolve(uploadConfig.UPLOADS_FOLDER, filename),
        (error) => {
          if (error) next(error);
        },
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(error);
      }
      return next(new AppError("Error showing file.", 500));
    }
  }
}

export { UploadsController };
