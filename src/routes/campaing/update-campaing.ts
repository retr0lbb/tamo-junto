import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";

const updateCampaingRouteParams = z.object({
	id: z.string().uuid(),
});

const updateCampaingSchema = z.object({
	name: z.string(),
	goal: z.string(),
});

export async function updateCampaingHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = updateCampaingRouteParams.parse(request.params);
	const { id: userId } = requestUser.parse(request.user);
	const { goal, name } = updateCampaingSchema.parse(request.body);

	const campaing = await prisma.campaing.findUnique({
		where: {
			id,
		},
	});

	if (!campaing) {
		return reply.status(404).send({ message: "Campaing not found" });
	}

	if (userId !== campaing.Userid) {
		return reply
			.status(403)
			.send({ message: "Only the creator of this campaing can update it" });
	}

	const result = await prisma.campaing.update({
		where: {
			id,
		},
		data: {
			goal,
			name,
		},
	});

	return reply
		.status(200)
		.send({ message: "your campaing was updated", data: result });
}

export async function updateCampaingRoute(app: FastifyInstance) {
	app.put(
		"/campaing/:id",
		{
			onRequest: [app.authenticate],
		},
		updateCampaingHandler,
	);
}
