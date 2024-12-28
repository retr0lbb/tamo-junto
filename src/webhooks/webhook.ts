import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { stripeClient } from "../lib/payment";
import donationEvent from "../events/emiters/donation.events";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";

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
			env.STRIPE_WEBHOOK_SECRET,
		);

		switch (event.type) {
			case "account.updated": {
				const account = event.data.object;
				if (!account || !account.requirements) {
					console.log("Conta nao conectada com objeto");
					return;
				}
				if (account.requirements.currently_due?.length === 0) {
					const fundedUser = await prisma.user.findUnique({
						where: {
							stripeID: account.id,
						},
					});

					console.log(fundedUser);
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
