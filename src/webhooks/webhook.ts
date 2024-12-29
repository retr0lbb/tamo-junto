import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { stripeClient } from "../lib/payment";
import donationEvent from "../events/emiters/donation.events";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";
import { ClientError } from "../_errors/clientError";
import CampaingEvent from "../events/emiters/campaing.events";

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
		const event = stripeClient.webhooks.constructEvent(
			request.rawBody,
			sig,
			env.STRIPE_WEBHOOK_SECRET,
		);

		switch (event.type) {
			case "account.updated": {
				const account = event.data.object;
				if (!account || !account.requirements) {
					throw new ClientError("Account not connected in stripe");
				}
				if (account.requirements.currently_due?.length === 0) {
					const fundedUser = await prisma.user.findUnique({
						where: {
							stripeID: account.id,
						},
					});
				}
				break;
			}

			case "checkout.session.completed": {
				console.log(event.data.object.id);

				if (event.data.object.payment_status === "paid") {
					const payment = await prisma.donation.findUnique({
						where: {
							stripePaymentId: event.data.object.id,
						},
						include: {
							User: true,
							Campaing: {
								select: {
									name: true,
								},
							},
						},
					});

					if (!payment) {
						throw new ClientError("Payment did not exitst");
					}

					await prisma.donation.update({
						where: {
							stripePaymentId: event.data.object.id,
						},
						data: {
							status: true,
						},
					});

					if (!payment.User || !payment.Campaing) {
						console.log("havent");
						return;
					}

					console.log("sending email");
					donationEvent.sendEmail({
						subject: `Donation for campaing: ${payment.Campaing.name}`,
						text: `Hello dear ${payment.User.name} Your donation for the campaing: 
						${payment.Campaing.name} on the value of ${payment.donationAmmount.toNumber()} 
						was completed sucessfully you now can verify if you won a milestone achivement`,
						to: payment.User.email,
					});
				}

				break;
			}

			case "payment_intent.payment_failed": {
				const donation = await prisma.donation.findUnique({
					where: {
						stripePaymentId: event.data.object.id,
					},
				});
				break;
			}

			default:
				console.log("nao esperado⛔: ", event.type);
				break;
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
