import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../../lib/prisma";
import z from "zod";
import { hash } from "bcrypt";
import { createUser } from "../../domain/create-user-service";
import { createUserPayloadDTO } from "../../domain/dto/create-user.dto";

export async function createUserHandler(
	this: FastifyInstance,
	request: FastifyRequest,
	reply: FastifyReply,
) {

	const data = createUserPayloadDTO.parse(request.body)

	const passwordHash = await hash(data.password, 10);

	const user = await createUser({...data, password: passwordHash}, prisma)
	const token = this.jwt.sign({ id: user.id });

	return reply
		.status(201)
		.send({ message: "User created sucessfully", data: token });
}

export async function createUserRoute(app: FastifyInstance) {
	app.post("/user", createUserHandler);
}
