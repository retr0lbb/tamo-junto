import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";

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

	const user = await prisma.user.findUnique({
		where: {
			email: email,
		},
	});

	if (!user) {
		return reply.status(404).send({ message: "User not found" });
	}

	if (password !== user.password) {
		return reply.status(400).send({ message: "Password or email didnt match" });
	}

	const token = this.jwt.sign({ id: user.id });

	return reply.status(200).send({ token });
}

export async function loginUserRoute(app: FastifyInstance) {
	app.post("/login", loginUserHandler);
}

//semitoken eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ3YWQ4NTQzLWM3OGEtNGNkYS1hYTQ1LTE5YWI0YzIzOGUwNCIsImlhdCI6MTczNDQ3Nzc4N30.6RvadKkLdT_UhyRc5UqH7REhr-MQxnlTh8lXQPtrkz
