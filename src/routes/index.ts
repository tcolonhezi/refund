import { Router } from "express";
import { usersRoutes } from "./users-routes.js";
import { sessionsRoutes } from "./sessions-routes.js";
import { refundsRoutes } from "./refunds-routes.js";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated.js";
import { uploadsRoutes } from "./upload-routes.js";

const routes = Router();

//Rotas Públicas
routes.use("/users", usersRoutes);
routes.use("/sessions", sessionsRoutes);

//Rotas Privadas
routes.use(ensureAuthenticated);
routes.use("/refunds", refundsRoutes);

routes.use("/uploads", uploadsRoutes);
export { routes };
