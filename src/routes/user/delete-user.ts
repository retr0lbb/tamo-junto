import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { requestUser } from "../../lib/request-user-jwt";
import { UserModel } from "../../models/user.model";

export async function deleteUserHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id: userId } = requestUser.parse(request.user);

	try {
		await new UserModel(prisma).deleteUser({ id: userId });

		return reply.status(201).send();
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function deleteUserRoute(app: FastifyInstance) {
	app.delete("/user", { onRequest: [app.authenticate] }, deleteUserHandler);
}
