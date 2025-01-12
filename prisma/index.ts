import { PrismaClient } from "@prisma/client";

const prismaClientLocal = new PrismaClient();

prismaClientLocal.$connect();

export default prismaClientLocal;