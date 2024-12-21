import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";
import { hash } from "bcrypt";
import { UserModel } from "../../models/user.model";
import { ClientError } from "../../_errors/clientError";

const deleteUserRouteParams = z.object({
	id: z.string().uuid(),
});

export async function deleteUserHandler(
	this: FastifyInstance,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id: userId } = requestUser.parse(request.user);
	const { id } = deleteUserRouteParams.parse(request.params);

	if (userId !== id) {
		throw new ClientError("Cannot delete user other than yourself");
	}

	await UserModel.deleteUser(prisma, { id });

	return reply.status(201);
}

export async function deleteUserRoute(app: FastifyInstance) {
	app.delete("/user/:id", deleteUserHandler);
}
