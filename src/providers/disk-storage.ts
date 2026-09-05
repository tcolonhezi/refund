import fs from "node:fs";
import path from "node:path";

import uploadConfig from "@/configs/upload.js";
import { AppError } from "@/utils/AppError.js";

class DiskStorage {
  async saveFile(file: string) {
    const tmpPath = path.resolve(uploadConfig.TMP_FOLDER, file);
    const destPath = path.resolve(uploadConfig.UPLOADS_FOLDER, file);

    try {
      await fs.promises.access(tmpPath);

      await fs.promises.mkdir(uploadConfig.UPLOADS_FOLDER, { recursive: true });

      await fs.promises.rename(tmpPath, destPath);

      return destPath;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async deleteFile(file: string, type: "tmp" | "upload") {
    const pathFile =
      type === "tmp" ? uploadConfig.TMP_FOLDER : uploadConfig.UPLOADS_FOLDER;

    const filePath = path.resolve(pathFile, file);

    await fs.promises.stat(filePath);
    await fs.promises.unlink(filePath);
  }
}

export { DiskStorage };
