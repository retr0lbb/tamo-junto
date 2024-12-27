import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { stripeClient } from "../lib/payment";

export async function ListenWebHookHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const sig = request.headers["stripe-signature"];
	if (!sig) {
		return reply.status(400).send({ message: "no sig founded" });
	}
	if (!request.rawBody) {
		console.log("no raw body");
		return;
	}

	try {
		// Constrói o evento com o corpo bruto
		const event = stripeClient.webhooks.constructEvent(
			request.rawBody,
			sig,
			"whsec_0ca6a9c38f0a48538da00101f2effd38b28e3f4855f3b92e6322415e38256548",
		);

		switch (event.type) {
			case "account.updated": {
				const account = event.data.object;
				if (!account || !account.requirements) {
					console.log("Conta nao conectada com objeto");
					return;
				}
				if (account.requirements.currently_due?.length === 0) {
					console.log("conta ja completou o onboarding");
				}
				break;
			}
			default:
				console.log("not expected");
				console.log(event.type);
		}
	} catch (error) {
		console.log(error);
		reply.status(400).send("error");
	}

	return reply.send("got you");
}

export async function ListenWebHookRoute(app: FastifyInstance) {
	app.post(
		"/webhooks",
		{
			config: {
				rawBody: true,
			},
		},
		ListenWebHookHandler,
	);
}
