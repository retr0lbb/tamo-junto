import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";
import { CampaignModel } from "../../models/campaing.model";

const updateCampaignRouteParams = z.object({
	id: z.string().uuid(),
});

const updateCampaignSchema = z.object({
	name: z.string(),
	goal: z.number(),
});

export async function updateCampaignHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = updateCampaignRouteParams.parse(request.params);
	const { id: userId } = requestUser.parse(request.user);
	const { goal, name } = updateCampaignSchema.parse(request.body);

	const campaing = await new CampaignModel(prisma).verifyIfCampaingExists({
		id,
	});

	if (!campaing) {
		return reply.status(404).send({ message: "Campaing not found" });
	}

	if (userId !== campaing.Userid) {
		return reply
			.status(403)
			.send({ message: "Only the creator of this campaing can update it" });
	}

	const result = await new CampaignModel(prisma).updateCampaing({
		goal,
		id,
		name,
	});

	return reply
		.status(200)
		.send({ message: "your campaing was updated", data: result });
}

export async function updateCampaignRoute(app: FastifyInstance) {
	app.put(
		"/campaing/:id",
		{
			onRequest: [app.authenticate],
		},
		updateCampaignHandler,
	);
}
