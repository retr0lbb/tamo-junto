import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { Prisma as PrismaClient } from "@prisma/client";
import z from "zod";

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
	const { minDonation, objectiveAmmount } = createMilestoneSchema.parse(
		request.body,
	);

	const campaing = await prisma.campaing.findUnique({
		where: {
			id,
		},
		include: {
			User: true,
		},
	});

	if (!campaing) {
		return reply.status(404).send({ message: "Campaing not found" });
	}

	const [milestone, donationsArray] = await Promise.all([
		await prisma.milestone.findFirst({
			where: {
				objectiveAmmount: objectiveAmmount,
			},
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

	if (milestone !== null) {
		return reply
			.status(400)
			.send({ message: "One milestone with this objective was founded" });
	}

	const totalCollectedValueOfCampaing = new PrismaClient.Decimal(0);

	for (const donation in donationsArray) {
		totalCollectedValueOfCampaing.plus(donation);
	}

	if (
		totalCollectedValueOfCampaing.comparedTo(objectiveAmmount) === 1 &&
		!Number.isNaN(totalCollectedValueOfCampaing.comparedTo(objectiveAmmount))
	) {
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
	app.post("/campaing/:id/milestone", createMilestoneHandler);
}
