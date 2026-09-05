import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization.js";
import { UploadsController } from "@/controllers/uploads-controller.js";
import { Router } from "express";
import uploadConfig from "@/configs/upload.js";
import multer from "multer";

const uploadsRoutes = Router();
const uploadsController = new UploadsController();

const upload = multer(uploadConfig.MULTER);

uploadsRoutes.get(
  "/:filename",
  verifyUserAuthorization(["EMPLOYEE", "MANAGER"]),
  uploadsController.show,
);

uploadsRoutes.use(verifyUserAuthorization(["EMPLOYEE"]));
uploadsRoutes.post("/", upload.single("file"), uploadsController.create);

export { uploadsRoutes };
