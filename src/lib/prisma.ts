import { PrismaClient } from "../../generated/prisma/client";
import { env } from "./env";
import { PrismaPg } from "@prisma/adapter-pg";


const adapter = new PrismaPg({connectionString: env.DATABASE_URL})

export const prisma = new PrismaClient({ adapter, log: ["error"]})


