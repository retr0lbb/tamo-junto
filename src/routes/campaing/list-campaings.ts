import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { Campaing } from "../../models/campaing.model";

const queryParams = z.object({
	page: z
		.string()
		.transform((val) => Number.parseInt(val, 10))
		.optional()
		.default("0"),
	user: z.string().uuid().optional(),
});

export async function listCampaingsHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { user, page } = queryParams.parse(request.query);

	const campaings = await Campaing.getCampaingsByPage(prisma, { page, user });

	if (campaings.length <= 0) {
		return reply.status(404).send({ message: "no campaings left" });
	}

	return reply.status(200).send({ data: campaings });
}

export async function listCampaingsRoute(app: FastifyInstance) {
	app.get("/campaing", listCampaingsHandler);
}
