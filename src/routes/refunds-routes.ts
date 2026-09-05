import { RefundsController } from "@/controllers/refunds-controller.js";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization.js";
import { Router } from "express";

const refundsRoutes = Router();
const refundsController = new RefundsController();

refundsRoutes.post(
  "/",
  verifyUserAuthorization(["EMPLOYEE"]),
  refundsController.create,
);
refundsRoutes.get(
  "/",
  verifyUserAuthorization(["MANAGER", "EMPLOYEE"]),
  refundsController.list,
);

refundsRoutes.get(
  "/:id",
  verifyUserAuthorization(["MANAGER", "EMPLOYEE"]),
  refundsController.show,
);

export { refundsRoutes };
