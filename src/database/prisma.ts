import { PrismaClient } from "@/generated/prisma/client.js";
import { env } from "@/utils/env.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
  log: ["query"],
});

export { prisma };
