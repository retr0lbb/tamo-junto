import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../../lib/prisma";
import { logInUser } from "../../domain/login-user-service";
import { loginUserPayloadDTO } from "../../domain/dto/login-user.dto";

export async function loginUserHandler(
	this: FastifyInstance,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const data = loginUserPayloadDTO.parse(request.body)
	
	const user = await logInUser(data, prisma)
	const token = this.jwt.sign({ id: user.id });

	return reply.status(200).send({ token });
}

export async function loginUserRoute(app: FastifyInstance) {
	app.post("/login", loginUserHandler);
}
