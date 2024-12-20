import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { Prisma as PrismaClient } from "@prisma/client";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";
import { Campaing } from "../../models/campaing.model";
import { Milestone } from "../../models/milestone.model";

export const createMilestoneSchema = z.object({
	objectiveAmmount: z.number().positive(),
	minDonation: z.number().positive().nullable(),
});
const createMilestoneRouteParams = z.object({
	id: z.string().uuid(),
});

export async function createMilestoneHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = createMilestoneRouteParams.parse(request.params);
	const { id: userId } = requestUser.parse(request.user);
	const { minDonation, objectiveAmmount } = createMilestoneSchema.parse(
		request.body,
	);

	const campaing = await Campaing.getCampaing(prisma, { id });

	if (!campaing) {
		return reply.status(404).send({ message: "Campaing not found" });
	}

	if (campaing.Userid !== userId) {
		return reply.status(403).send({
			message:
				"You could not create a milestone on an Campaing thats not yours",
		});
	}

	if (
		objectiveAmmount >= campaing.goal.toNumber() ||
		(minDonation !== null && minDonation >= campaing.goal.toNumber())
	) {
		return reply
			.status(400)
			.send({ message: "Objective cannot surpass campaing goal" });
	}

	const [milestone, donationsArray] = await Promise.all([
		await Milestone.verifyIfThisMilestoneDontAlreadyExists(prisma, {
			campaingId: id,
			goal: objectiveAmmount,
		}),
		await prisma.donation.findMany({
			where: {
				Campaingid: id,
			},
			select: {
				donationAmmount: true,
			},
		}),
	]);

	if (milestone) {
		return reply
			.status(400)
			.send({ message: "One milestone with this objective was founded" });
	}

	const totalCollectedValueOfCampaing = donationsArray.reduce(
		(acc, donation) => {
			return acc.plus(donation.donationAmmount);
		},
		new PrismaClient.Decimal(0),
	);

	if (totalCollectedValueOfCampaing.comparedTo(objectiveAmmount) === 1) {
		return reply
			.status(400)
			.send({ message: "Campaing already collected more than milestone" });
	}

	const milestoneResult = await prisma.milestone.create({
		data: {
			minDonation: minDonation ?? 0,
			objectiveAmmount,
			Campaingid: id,
		},
	});

	return reply
		.status(201)
		.send({ message: "Milestone Created with success", data: milestoneResult });
}

export async function createMilestoneRoute(app: FastifyInstance) {
	app.post(
		"/campaing/:id/milestone",
		{
			onRequest: [app.authenticate],
		},
		createMilestoneHandler,
	);
}
