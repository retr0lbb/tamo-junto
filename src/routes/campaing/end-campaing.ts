import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";

const deleteCampaingRouteParams = z.object({
	id: z.string().uuid(),
});

export async function deleteCampaingHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = deleteCampaingRouteParams.parse(request.params);
	const { id: userId } = requestUser.parse(request.user);

	const campaing = await prisma.campaing.findUnique({
		where: {
			id,
		},
	});

	if (!campaing) {
		return reply.status(404).send({ message: "Campaing not found" });
	}

	if (userId !== campaing.Userid) {
		return reply
			.status(403)
			.send({ message: "Only the creator of this campaing can delete it" });
	}

	const result = await prisma.campaing.delete({
		where: {
			id,
		},
	});

	return reply.status(200).send({ message: "your campaing was deleted" });
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
