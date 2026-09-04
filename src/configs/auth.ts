import { SignOptions } from "jsonwebtoken";
import { env } from "@/utils/env.js";

export const authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: "1d" as SignOptions["expiresIn"],
  },
};
