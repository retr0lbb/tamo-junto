import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { Prisma as PrismaClient } from "@prisma/client";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";
import { Campaing } from "../../models/campaing.model";
import { Milestone } from "../../models/milestone.model";

export const createMilestoneSchema = z.object({
	objectiveAmmount: z.number().positive(),
	minDonation: z.number().positive().nullable(),
	name: z.string().min(3),
	description: z.string().nullable(),
});
const createMilestoneRouteParams = z.object({
	id: z.string().uuid(),
});

export async function createMilestoneHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = createMilestoneRouteParams.parse(request.params);
	const { id: userId } = requestUser.parse(request.user);
	const { minDonation, objectiveAmmount, description, name } =
		createMilestoneSchema.parse(request.body);

	const milestone = await Milestone.createMilestone(prisma, {
		campaingId: id,
		name,
		objectiveAmmount,
		userId,
		description,
		minDonation,
	});

	return reply
		.status(201)
		.send({ message: "Milestone Created with success", data: milestone });
}

export async function createMilestoneRoute(app: FastifyInstance) {
	app.post(
		"/campaing/:id/milestone",
		{
			onRequest: [app.authenticate],
		},
		createMilestoneHandler,
	);
}
