import { compare } from "bcrypt";
import type { PrismaClient } from "../../../../generated/prisma/client";
import type { loginUserPayload } from "./dto/login-user.dto";
import { ClientError } from "../../../_errors/clientError";

export async function logInUser(data: loginUserPayload, db: PrismaClient) {
    const user = await db.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const match = await compare(data.password, user.password);
    if (match === false) {
        throw new ClientError("Password didn't match!");
    }

    return user;
}
