import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { MilestoneModel } from "../../models/milestone.model";
import { PrizeModel } from "../../models/prize.model";
import { requestUser } from "../../lib/request-user-jwt";
import { ClientError } from "../../_errors/clientError";
import { NotFound } from "../../_errors/notFoundError";
import { Unautorized } from "../../_errors/unautorized";
import { ServerError } from "../../_errors/serverError";

const confirmPrizeRecievedParams = z.object({
	concluded_id: z.string().uuid(),
});

export async function confirmPrizeRecieved(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const { concluded_id } = confirmPrizeRecievedParams.parse(request.params);

		const { id: UserId } = requestUser.parse(request.user);

		const milestoneWinnerData = await prisma.prizedWinnedByUsers.findUnique({
			where: {
				id: concluded_id,
			},
		});

		if (!milestoneWinnerData) {
			throw new NotFound("Winning prize data not found");
		}

		if (milestoneWinnerData.Userid !== UserId) {
			throw new Unautorized("Access Forbidden");
		}

		await prisma.prizedWinnedByUsers.update({
			data: {
				confirmedPrizeRecived: true,
				prizeArriveDate: new Date(),
			},
			where: {
				id: concluded_id,
			},
		});
		return reply.status(201).send({
			message: "You confirmed the recievement of the prize with sucess",
		});
	} catch (error) {
		console.log(error);
		throw new ServerError("An error occurred at server");
	}
}

export async function confirmPrizeRecievedRoute(app: FastifyInstance) {
	app.get(
		"/confirm-recived/:concluded_id",
		{
			onRequest: [app.authenticate],
		},
		confirmPrizeRecieved,
	);
}
