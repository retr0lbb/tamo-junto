import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";
import { Campaing } from "../../models/campaing.model";
import { ServerError } from "../../_errors/serverError";

const deleteCampaingRouteParams = z.object({
	id: z.string().uuid(),
});

export async function deleteCampaingHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = deleteCampaingRouteParams.parse(request.params);
	const { id: userId } = requestUser.parse(request.user);

	try {
		const deletedCampaing = await new Campaing(prisma).deleteCampaing({
			id,
			userId,
		});

		return reply
			.status(200)
			.send({ message: "your campaing was deleted", data: deletedCampaing });
	} catch (error) {
		return new ServerError("an error occured processing delet campaing");
	}
}

export async function deleteCampaingRoute(app: FastifyInstance) {
	app.delete(
		"/campaing/:id",
		{
			onRequest: [app.authenticate],
		},
		deleteCampaingHandler,
	);
}
