import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { hash } from "bcrypt";
import { UserModel } from "../../models/user.model";

export const createUserSchema = z.object({
	name: z.string().nonempty({ message: "A name must be provided" }),
	email: z.string().email({ message: "Invalid email." }),
	password: z.string({ message: "Password is invalid" }).min(8).max(64),
	addressInfo: z
		.string({ message: "Adress info could be null but it must be provided" })
		.nullable(),
});

export async function createUserHandler(
	this: FastifyInstance,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { addressInfo, email, name, password } = createUserSchema.parse(
		request.body,
	);

	const rashPassword = await hash(password, 10);

	const insertedUser = await UserModel.createUser(prisma, {
		addressInfo,
		email,
		name,
		password: rashPassword,
	});

	const token = this.jwt.sign({ id: insertedUser.id });

	return reply
		.status(201)
		.send({ message: "User created sucessfully", data: token });
}

export async function createUserRoute(app: FastifyInstance) {
	app.post("/user", createUserHandler);
}
