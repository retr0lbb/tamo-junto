import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { requestUser } from "../../lib/request-user-jwt";
import { ClientError } from "../../_errors/clientError";
import { createStripeRelatedUser } from "../../lib/payment";

export async function CreateStripeUSerHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id: userId } = requestUser.parse(request.user);

	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			throw new ClientError(
				"Cannot conect to a stripe account without creating your own account",
			);
		}

		const [firstName, lastName] = user.name.split(" ");

		const something = await createStripeRelatedUser({
			email: user.email,
			firstName,
			lastName,
		});

		return reply.status(200).send({ something });
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function CreateStripeUserRoute(app: FastifyInstance) {
	app.post(
		"/user/stripe",
		{ onRequest: [app.authenticate] },
		CreateStripeUSerHandler,
	);
}
