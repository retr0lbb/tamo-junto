import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { Prisma as PrismaClient } from "@prisma/client";
import { CampaingModel } from "../../models/campaing.model";
import { MilestoneModel } from "../../models/milestone.model";
import { DonationModel } from "../../models/donation.model";

const getCampaingRouteParams = z.object({
	id: z.string().uuid(),
});

export async function getCampaingHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = getCampaingRouteParams.parse(request.params);

	const campaing = await new CampaingModel(prisma).getCampaing({ id });

	if (!campaing) {
		return reply.status(404).send({ message: "Campaing not found" });
	}

	const [milestones, donations] = await Promise.all([
		new MilestoneModel(prisma).getMilestonesByCampaingId({ id }),
		new DonationModel(prisma).getAllCampaingDonations({
			campainId: id,
		}),
	]);

	const { confirmedPaymentsValue, unConfirmedPaymentsValue } =
		await DonationModel.getTotalDonatedValueToACampaing(prisma, {
			campaingId: id,
		});

	const percentageOfCompletion = (
		(confirmedPaymentsValue.toNumber() / campaing.goal.toNumber()) *
		100
	).toFixed(2);

	const betterCampaingObject = {
		campaingId: campaing.id,
		title: campaing.name,
		goal: campaing.goal,
		totalPaidValues: confirmedPaymentsValue,
		unCompletedPaymentValues: unConfirmedPaymentsValue,
		completion: percentageOfCompletion,
		milestones: milestones.map((milestone) => {
			return {
				milestonId: milestone.id,
				target: milestone.objectiveAmmount,
				minDonation: milestone.minDonation,
			};
		}),
		donations: donations.map((donate) => {
			return {
				id: donate.id,
				date: donate.donationDate,
				ammount: donate.donationAmmount,
				completed: `${donate.status ? "Paid" : "Unpaid"}`,
			};
		}),
	};

	return reply.status(200).send({ data: betterCampaingObject });
}

export async function getCampaingRoute(app: FastifyInstance) {
	app.get("/campaing/:id", getCampaingHandler);
}
