import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { stripeClient } from "../lib/payment";
import { requestUser } from "../lib/request-user-jwt";

export async function ListenWebHookHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const sig = request.headers["stripe-signature"];
	if (!sig) {
		return reply.status(400).send({ message: "no sig founded" });
	}

	try {
		const event = stripeClient.webhooks.constructEvent(
			request.body as unknown as string,
			sig,
			"whsec_0ca6a9c38f0a48538da00101f2effd38b28e3f4855f3b92e6322415e38256548",
		);

		switch (event.type) {
			case "account.external_account.created":
				console.log(event.type);
				break;
			default:
				console.log(event.type);
		}
	} catch (error) {
		reply.status(404).send("error");
	}

	return reply.send("got yuou");
}

export async function ListenWebHookRoute(app: FastifyInstance) {
	app.get("/webhooks", ListenWebHookHandler);
}
