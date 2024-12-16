import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { Prisma as PrismaClient } from "@prisma/client";

const getCampaingRouteParams = z.object({
	id: z.string().uuid(),
});

export async function getCampaingHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = getCampaingRouteParams.parse(request.params);

	const campaing = await prisma.campaing.findUnique({
		where: {
			id,
		},
		include: {
			donations: true,
			milestones: true,
		},
	});

	if (!campaing) {
		return reply.status(404).send({ message: "Campaing not found" });
	}

	const totalCollectedValueOfCampaing = campaing.donations.reduce(
		(acc, donation) => {
			return acc.plus(donation.donationAmmount);
		},
		new PrismaClient.Decimal(0),
	);

	const percentageOfCompletion = (
		(totalCollectedValueOfCampaing.toNumber() / campaing.goal.toNumber()) *
		100
	).toFixed(2);

	const betterCampaingObject = {
		campaingId: campaing.id,
		title: campaing.name,
		goal: campaing.goal,
		totalDonated: totalCollectedValueOfCampaing,
		completion: percentageOfCompletion,
		milestones: campaing.milestones.map((milestone) => {
			return {
				milestonId: milestone.id,
				target: milestone.objectiveAmmount,
				minDonation: milestone.minDonation,
			};
		}),
	};

	return reply.status(200).send({ data: betterCampaingObject });
}

export async function getCampaingRoute(app: FastifyInstance) {
	app.get("/campaing/:id", getCampaingHandler);
}
