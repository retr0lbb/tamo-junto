import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { UserModel } from "../../models/user.model";
import { ServerError } from "../../_errors/serverError";

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

	try {
		const user = await new UserModel(prisma).logInUser({
			email,
			password,
		});
		const token = this.jwt.sign({ id: user.id });

		return reply.status(200).send({ token });
	} catch (error) {
		throw new ServerError("An error occured at loggin user in");
	}
}

export async function loginUserRoute(app: FastifyInstance) {
	app.post("/login", loginUserHandler);
}
