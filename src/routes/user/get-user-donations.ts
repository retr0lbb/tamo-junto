import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { UserModel } from "../../models/user.model";

const getUserDonatiosParams = z.object({
	id: z.string().uuid(),
});

export async function createPrizeHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = getUserDonatiosParams.parse(request.params);
	const donations = await UserModel.gerUserDonations(prisma, { id });

	if (!donations) {
		return reply.status(200).send([]);
	}

	reply.status(200).send({ data: donations });
}

export async function getUserDonatiosRoute(app: FastifyInstance) {
	app.get("/user/:id/donations", createPrizeHandler);
}
