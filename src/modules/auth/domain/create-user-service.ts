import type { PrismaClient } from "../../../../generated/prisma/client";
import { ClientError } from "../../../_errors/clientError";
import type { CreateUserPayload } from "./dto/create-user.dto";

export async function createUser({ addressInfo, email, name, password }: CreateUserPayload, db: PrismaClient) {
    const isUserInDatabaseAlready = await db.user.findUnique({
        where: {
            email,
        },
    });

    if (isUserInDatabaseAlready !== null) {
        throw new ClientError("An user with this email already exists");
    }

    const insertedUser = await db.user.create({
        data: {
            email,
            name,
            password,
            addressInfo: addressInfo ? addressInfo : null,
        },
        select: {
            id: true,
        },
    });
    return insertedUser;
}