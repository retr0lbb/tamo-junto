import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { UserModel } from "../../models/user.model";

export const loginUserSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export async function loginUserHandler(
	this: FastifyInstance,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { email, password } = loginUserSchema.parse(request.body);

	const user = await UserModel.logInUser(prisma, { email, password });
	const token = this.jwt.sign({ id: user.id });

	return reply.status(200).send({ token });
}

export async function loginUserRoute(app: FastifyInstance) {
	app.post("/login", loginUserHandler);
}
