import { UserController } from "@/controllers/users-controller.js";
import { Router } from "express";

const usersRoutes = Router();
const userController = new UserController();

usersRoutes.post("/", userController.createUser);

export { usersRoutes };
