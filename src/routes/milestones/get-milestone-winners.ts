import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";
import { MilestoneModel } from "../../models/milestone.model";
import { ClientError } from "../../_errors/clientError";
import { ServerError } from "../../_errors/serverError";

const getMilestoneWinnersRouteParams = z.object({
	milestoneId: z.string().uuid(),
});

export async function getMilestoneWinnersHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const { milestoneId } = getMilestoneWinnersRouteParams.parse(
			request.params,
		);
		const { id: userId } = requestUser.parse(request.user);

		const milestone = await new MilestoneModel(prisma).getMilestone({
			id: milestoneId,
		});

		if (!milestone) {
			return reply.status(404).send({ message: "Milestone not found" });
		}

		if (!milestone.Campaingid) {
			throw new ClientError("Milestone must have a campaing on their own");
		}

		const campaing = await prisma.campaing.findUnique({
			where: {
				id: milestone.Campaingid,
			},
		});

		if (!campaing || !campaing.Userid) {
			return new ClientError("Cannot found campaing or campaing owner");
		}

		if (!campaing.Userid || userId !== campaing.Userid) {
			throw new ClientError("Only campaing owner can get milestone winners");
		}

		const data = await new MilestoneModel(prisma).getMilestoneWinners(
			milestone.id,
		);
		return reply.status(200).send({ data: data });
	} catch (error) {
		console.log(error);
		return new ServerError(
			"An error occured while processing milestonewinners",
		);
	}
}

export async function getMilestoneWinnersRoute(app: FastifyInstance) {
	app.get(
		"/milestone/:milestoneId",
		{
			onRequest: [app.authenticate],
		},
		getMilestoneWinnersHandler,
	);
}
