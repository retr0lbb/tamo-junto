import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";
import { CampaignModel } from "../../models/campaing.model";
import { ServerError } from "../../_errors/serverError";

const deleteCampaignRouteParams = z.object({
	id: z.uuid()
});

export async function deleteCampaignHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = deleteCampaignRouteParams.parse(request.params);
	const { id: userId } = requestUser.parse(request.user);

	try {
		const deletedCampaing = await new CampaignModel(prisma).deleteCampaign({
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

export async function deleteCampaignRoute(app: FastifyInstance) {
	app.delete(
		"/campaing/:id",
		{
			onRequest: [app.authenticate],
		},
		deleteCampaignHandler,
	);
}
