import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";

export const createCampaingSchema = z.object({
	userId: z.string().uuid(),
	campaingName: z.string().nonempty(),
	campaingObjectiveAmmount: z.number().positive(),
});

export async function createCampaingHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { campaingName, userId, campaingObjectiveAmmount } =
		createCampaingSchema.parse(request.body);

	await prisma.user.findUniqueOrThrow({
		where: {
			id: userId,
		},
	});

	const campaing = await prisma.campaing.create({
		data: {
			name: campaingName,
			Userid: userId,
			goal: campaingObjectiveAmmount,
		},
		select: { id: true, donations: true, milestones: true },
	});

	return reply
		.status(201)
		.send({ message: "Campaing created with sucess", data: campaing });
}

export async function createCampaingRoute(app: FastifyInstance) {
	app.post("/campaing", createCampaingHandler);
}
