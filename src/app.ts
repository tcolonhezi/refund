import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import { errorHandling } from "./middlewares/error-handling.js";
import { routes } from "./routes/index.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  const { method, url } = req;
  console.log(`[${method}] ${url}`);
  next();
});

app.get("/alive", (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({
    message: "Ok",
    upTime: process.uptime(),
  });
});

app.use(routes);

app.use(errorHandling);

export { app };
