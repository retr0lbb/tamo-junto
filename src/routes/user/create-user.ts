import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";

export const createUserSchema = z.object({
	name: z.string().nonempty({ message: "A name must be provided" }),
	email: z.string().email({ message: "Invalid email." }),
	password: z.string({ message: "Password is invalid" }).min(8).max(64),
	addressInfo: z
		.string({ message: "Adress info could be null but it must be provided" })
		.nullable(),
});

export async function createUserHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { addressInfo, email, name, password } = createUserSchema.parse(
		request.body,
	);

	const isUserInDatabaseAlready = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (isUserInDatabaseAlready !== null) {
		return reply.status(400).send({ message: "User Already registered." });
	}

	const insertedUser = await prisma.user.create({
		data: {
			email,
			name,
			password,
			addressInfo: addressInfo ? addressInfo : null,
		},
		select: {
			id: true,
		},
	});

	return reply
		.status(201)
		.send({ message: "User created sucessfully", data: insertedUser });
}

export async function createUserRoute(app: FastifyInstance) {
	app.post("/user", createUserHandler);
}
