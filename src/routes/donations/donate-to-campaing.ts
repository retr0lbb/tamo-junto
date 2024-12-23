import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { Prisma as PrismaClient } from "@prisma/client";
import { requestUser } from "../../lib/request-user-jwt";
import z from "zod";
import { Campaing } from "../../models/campaing.model";
import donationEvent from "../../events/emiters/donation.events";
import { ClientError } from "../../_errors/clientError";
import { ServerError } from "../../_errors/serverError";
import {
	generatePaymentIntent,
	generatePaymentSession,
} from "../../lib/payment";

export const createDonationSchema = z.object({
	donationAmmount: z.number().positive().nonnegative().min(0.01),
});
const createDonationRouteParams = z.object({
	id: z.string().uuid(),
});

export async function createDonationHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { donationAmmount } = createDonationSchema.parse(request.body);
	const { id: userId } = requestUser.parse(request.user);

	const { id } = createDonationRouteParams.parse(request.params);

	try {
		const campaing = await Campaing.verifyIfCampaingExists(prisma, { id });

		if (!campaing) {
			return reply.status(404).send({ message: "Campaing not found" });
		}

		if (campaing.Userid === userId) {
			return reply
				.status(403)
				.send({ message: "You cannot donate to your own campaing" });
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
			totalCollectedValueOfCampaing
				.plus(donationAmmount)
				.comparedTo(campaing.goal) === 1
		) {
			return reply
				.status(400)
				.send({ message: "Cannot donate to a campaing that achived its goal" });
		}

		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: { email: true },
		});
		if (!user) {
			throw new ClientError("The user of this token no longer exits");
		}

		const donation = await prisma.donation.create({
			data: {
				donationAmmount,
				Campaingid: id,
				Userid: userId,
			},
		});

		const result = await generatePaymentSession({
			campaingName: campaing.name,
			price: donationAmmount,
		});

		console.log(result);

		donationEvent.emitCheckIfMilestoneIsCompleted(
			campaing.id,
			totalCollectedValueOfCampaing.toNumber() + donationAmmount,
		);

		donationEvent.sendEmail({
			subject: "Donation complete",
			text: `You sucessfully donated to ${campaing.name} with the value of R$ ${donationAmmount}`,
			to: user.email,
		});

		return reply.status(201).send({
			message: "donation computed with sucess",
			data: donation,
		});
	} catch (error) {
		console.log(error);
		throw new ServerError("An error occurred at donations");
	}
}

export async function createDonationRoute(app: FastifyInstance) {
	app.post(
		"/campaing/:id/donate",
		{ onRequest: [app.authenticate] },
		createDonationHandler,
	);
}
