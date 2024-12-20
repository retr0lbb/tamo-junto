import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { Prisma as PrismaClient } from "@prisma/client";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";

const getMilestoneWinnersRouteParams = z.object({
	milestoneId: z.string().uuid(),
});

export async function getMilestoneWinnersHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { milestoneId } = getMilestoneWinnersRouteParams.parse(request.params);
	const { id: userId } = requestUser.parse(request.user);

	const milestone = await prisma.milestone.findUnique({
		where: {
			id: milestoneId,
		},
		include: {
			Campaing: true,
		},
	});

	if (!milestone) {
		return reply.status(404).send({ message: "Milestone not found" });
	}

	if (userId !== milestone.Campaing?.Userid) {
		return reply
			.status(403)
			.send({ message: "Only campaing owner can see winners" });
	}

	const winners = await prisma.userAchievedMilestone.findMany({
		where: {
			Milestoneid: milestoneId,
		},
		include: {
			User: {
				include: { Donations: true },
			},
		},
	});

	if (winners.length <= 0) {
		return reply
			.status(200)
			.send({ message: "nobody have achieved the metrics for this goal" });
	}
	const data = winners.map((winner) => {
		if (winner?.User) {
			return {
				winnerName: winner.User.name,
				winnerEmail: winner.User.email,
				addressInfo: winner.User.addressInfo,
				donations: winner.User.Donations.reduce(
					(acc, item) => acc + item.donationAmmount.toNumber(),
					0,
				),
			};
		}
	});
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
