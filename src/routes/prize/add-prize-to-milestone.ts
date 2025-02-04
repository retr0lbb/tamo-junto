import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { MilestoneModel } from "../../models/milestone.model";
import { PrizeModel } from "../../models/prize.model";
import { requestUser } from "../../lib/request-user-jwt";
import { ClientError } from "../../_errors/clientError";

export const createPrizeSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(12),
	data: z.string().optional(),
});
const createPrizeRouteParams = z.object({
	id: z.string().uuid(),
});

export async function createPrizeHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { data, description, name } = createPrizeSchema.parse(request.body);
	const { id: userId } = requestUser.parse(request.user);

	const { id } = createPrizeRouteParams.parse(request.params);

	const milestone = await new MilestoneModel(prisma).getMilestone({ id });

	if (!milestone || milestone.Campaingid === null) {
		return reply
			.status(404)
			.send({ message: "Milesonte not found or not in a campaing" });
	}

	const campaing = await prisma.campaing.findUnique({
		where: {
			id: milestone.Campaingid,
		},
	});

	if (!campaing) {
		throw new ClientError("This campaing doesnt exists no more");
	}

	if (userId !== campaing.Userid) {
		throw new ClientError(
			"Only campaing owner can create a prize to this milestone",
		);
	}

	const prize = await new PrizeModel(prisma).createPrize({
		description,
		milestoneId: id,
		name,
		prizeData: data,
	});

	return reply
		.status(201)
		.send({ message: "prize assing to milestone with success", data: prize });
}

export async function createPrizeRoute(app: FastifyInstance) {
	app.post(
		"/milestone/:id/prize",
		{
			onRequest: [app.authenticate],
		},
		createPrizeHandler,
	);
}
