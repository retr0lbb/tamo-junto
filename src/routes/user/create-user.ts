import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";

export async function createUserHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const results = await prisma.user.findMany();
	return reply.status(200).send({ status: 200, data: results });
}

export async function createUserRoute(app: FastifyInstance) {
	app.post("/user", createUserHandler);
}
