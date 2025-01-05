import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { MilestoneModel } from "../../models/milestone.model";
import { PrizeModel } from "../../models/prize.model";

export const createPrizeSchema = z.object({
	prizeName: z.string().min(1),
	prizeDescription: z.string().nullable(),
	isShippingPrize: z.coerce.boolean(),
});
const createPrizeRouteParams = z.object({
	id: z.string().uuid(),
});

export async function createPrizeHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { isShippingPrize, prizeDescription, prizeName } =
		createPrizeSchema.parse(request.body);

	const { id } = createPrizeRouteParams.parse(request.params);

	const milestone = await new MilestoneModel(prisma).getMilestone({ id });

	if (!milestone) {
		return reply.status(404).send({ message: "Milesonte not found" });
	}

	const prize = await new PrizeModel(prisma).createPrize({
		isShippingPrize,
		milestoneId: id,
		title: prizeName,
		uri: "http://localhost:3333",
		description: prizeDescription,
	});

	return reply
		.status(201)
		.send({ message: "prize assing to milestone with success", data: prize });
}

export async function createPrizeRoute(app: FastifyInstance) {
	app.post("/milestone/:id/prize", createPrizeHandler);
}
