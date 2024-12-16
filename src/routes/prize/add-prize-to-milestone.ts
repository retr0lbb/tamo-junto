import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { Prisma as PrismaClient } from "@prisma/client";
import multipart from "@fastify/multipart";
import z from "zod";

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

	const milestone = await prisma.milestone.findUnique({
		where: {
			id,
		},
	});

	if (!milestone) {
		return reply.status(404).send({ message: "Milesonte not found" });
	}

	//logic to google bucket

	const prize = await prisma.prize.create({
		data: {
			uri: "http://localhost:3333",
			title: prizeName,
			description: prizeDescription ?? "",
			isShippingPrize: isShippingPrize,
			Milestoneid: id,
		},
	});

	return reply
		.status(201)
		.send({ message: "prize assing to milestone with success", data: prize });
}

export async function createPrizeRoute(app: FastifyInstance) {
	app.post("/milestone/:id/prize", createPrizeHandler);
}
