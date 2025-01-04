import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";
import { Campaing } from "../../models/campaing.model";
import { ServerError } from "../../_errors/serverError";

export const createCampaingSchema = z.object({
	campaingName: z.string().nonempty(),
	campaingObjectiveAmmount: z.number().positive(),
});

export async function createCampaingHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { campaingName, campaingObjectiveAmmount } = createCampaingSchema.parse(
		request.body,
	);
	const { id: userId } = requestUser.parse(request.user);
	try {
		const campaing = await new Campaing(prisma).createCampaing({
			goal: campaingObjectiveAmmount,
			name: campaingName,
			Userid: userId,
		});

		return reply
			.status(201)
			.send({ message: "Campaing created with sucess", data: campaing });
	} catch (error) {
		return new ServerError(`An error occured at server: ${error}`);
	}
}

export async function createCampaingRoute(app: FastifyInstance) {
	app.post(
		"/campaing",
		{
			onRequest: [app.authenticate],
		},
		createCampaingHandler,
	);
}
