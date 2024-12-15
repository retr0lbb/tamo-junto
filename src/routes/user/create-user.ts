import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export async function createUserHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	return reply.status(200).send("Hey man");
}

export async function createUserRoute(app: FastifyInstance) {
	app.post("/user", createUserHandler);
}
