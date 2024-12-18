import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";

export async function listCampaingsHandler(
	_request: FastifyRequest,
	reply: FastifyReply,
) {
	const campaings = await prisma.campaing.findMany({
		select: {
			id: true,
			name: true,
			goal: true,
		},
	});

	if (campaings.length <= 0) {
		return reply.status(404).send({ message: "no campaings left" });
	}

	return reply.status(200).send({ data: campaings });
}

export async function listCampaingsRoute(app: FastifyInstance) {
	app.get("/campaing", listCampaingsHandler);
}
