import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { Prisma as PrismaClient } from "@prisma/client";
import z from "zod";

export const createDonationSchema = z.object({
	donationAmmount: z.number().positive().nonnegative().min(0.01),
	donatingUser: z.string().uuid(),
});
const createDonationRouteParams = z.object({
	id: z.string().uuid(),
});

export async function createDonationHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { donatingUser, donationAmmount } = createDonationSchema.parse(
		request.body,
	);

	const { id } = createDonationRouteParams.parse(request.params);

	const campaing = await prisma.campaing.findUnique({
		where: {
			id,
		},
	});

	if (!campaing) {
		return reply.status(404).send({ message: "Campaing not found" });
	}

	const donationsArray = await prisma.donation.findMany({
		where: {
			Campaingid: id,
		},
		select: {
			donationAmmount: true,
		},
	});

	const totalCollectedValueOfCampaing = donationsArray.reduce(
		(acc, donation) => {
			return acc.plus(donation.donationAmmount);
		},
		new PrismaClient.Decimal(0),
	);

	if (
		totalCollectedValueOfCampaing.comparedTo(campaing.goal) === 1 ||
		totalCollectedValueOfCampaing.comparedTo(campaing.goal) === 0
	) {
		return reply
			.status(400)
			.send({ message: "Cannot donate to a campaing that achived its goal" });
	}

	const donation = await prisma.donation.create({
		data: {
			donationAmmount,
			Campaingid: id,
			Userid: donatingUser,
		},
	});

	reply
		.status(201)
		.send({ message: "donation computed with sucess", data: donation });
}

export async function createDonationRoute(app: FastifyInstance) {
	app.post("/campaing/:id/donate", createDonationHandler);
}