import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { CampaignModel } from "../../models/campaing.model";

const queryParams = z.object({
	page: z.coerce.number().default(10),
	user: z.string().uuid().optional(),
});

export async function listCampaignsHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { user, page } = queryParams.parse(request.query);

	const campaings = await new CampaignModel(prisma).getCampaingsByPage({
		page,
		user,
	});

	if (campaings.length <= 0) {
		return reply.status(404).send({ message: "no campaings left" });
	}

	return reply.status(200).send({ data: campaings });
}

export async function listCampaignsRoute(app: FastifyInstance) {
	app.get("/campaing", listCampaignsHandler);
}
