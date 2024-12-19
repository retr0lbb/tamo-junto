import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { Prisma as PrismaClient } from "@prisma/client";
import { Campaing } from "../../models/campaing.model";

const getCampaingRouteParams = z.object({
	id: z.string().uuid(),
});

export async function getCampaingHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = getCampaingRouteParams.parse(request.params);

	const campaing = await Campaing.getCampaing(prisma, { id });
	if (!campaing) {
		return reply.status(404).send({ message: "Campaing not found" });
	}

	const [milestones, donations] = await Promise.all([
		prisma.milestone.findMany({
			where: {
				Campaingid: id,
			},
		}),
		prisma.donation.findMany({
			where: {
				Campaingid: id,
			},
		}),
	]);

	const totalCollectedValueOfCampaing = donations.reduce((acc, donation) => {
		return acc.plus(donation.donationAmmount);
	}, new PrismaClient.Decimal(0));

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
		milestones: milestones.map((milestone) => {
			return {
				milestonId: milestone.id,
				target: milestone.objectiveAmmount,
				minDonation: milestone.minDonation,
			};
		}),
		donations: donations
			? donations.map((donate) => {
					return {
						id: donate.id,
						date: donate.donationDate,
						ammount: donate.donationAmmount,
					};
				})
			: [],
	};

	return reply.status(200).send({ data: betterCampaingObject });
}

export async function getCampaingRoute(app: FastifyInstance) {
	app.get("/campaing/:id", getCampaingHandler);
}
