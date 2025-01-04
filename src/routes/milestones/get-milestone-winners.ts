import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";
import { Milestone } from "../../models/milestone.model";
import { ClientError } from "../../_errors/clientError";

const getMilestoneWinnersRouteParams = z.object({
	milestoneId: z.string().uuid(),
});

export async function getMilestoneWinnersHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { milestoneId } = getMilestoneWinnersRouteParams.parse(request.params);
	const { id: userId } = requestUser.parse(request.user);

	const milestone = await new Milestone(prisma).getMilestone({
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

	if (!campaing?.Userid || userId !== campaing.Userid) {
		return reply
			.status(403)
			.send({ message: "Campaing ID different then user ID" });
	}

	const data = await new Milestone(prisma).getMilestoneWinners(milestone.id);
	return reply.status(200).send({ data: data });
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
