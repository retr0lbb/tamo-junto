import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { requestUser } from "../../lib/request-user-jwt";
import z from "zod";
import { DonationModel } from "../../models/donation.model";

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
		const donation = await DonationModel.donateToCampaing(prisma, {
			campaingId: id,
			donnationAmmount: donationAmmount,
			userId: userId,
		});

		return reply.status(201).send({
			message: "donation computed with sucess",
			data: {
				paymentUrl: donation.url,
				paymentInfo: { ...donation },
			},
		});
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function createDonationRoute(app: FastifyInstance) {
	app.post(
		"/campaing/:id/donate",
		{ onRequest: [app.authenticate] },
		createDonationHandler,
	);
}
