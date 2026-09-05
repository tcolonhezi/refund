import { RefundsController } from "@/controllers/refunds-controller.js";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization.js";
import { Router } from "express";

const refundsRouter = Router();
const refundsController = new RefundsController();

refundsRouter.post(
  "/",
  verifyUserAuthorization(["EMPLOYEE"]),
  refundsController.create,
);

export { refundsRouter };
