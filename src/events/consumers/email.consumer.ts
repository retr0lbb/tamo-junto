import { ClientError } from "../../_errors/clientError";
import { type mailOptions, sendAnEmail } from "../../lib/mailtransport";
import { prisma } from "../../lib/prisma";
import { EventNames } from "../events";
import { EventHandler } from "../event-handler";

// TODO add RabbitMQ using docker to send messages

class EmailConsumer extends EventHandler {
	// biome-ignore lint/complexity/noUselessConstructor: <explanation>
	constructor() {
		super();
	}

	protected setUpListeners(): void {
		this.brokerInstance.on(EventNames.SEND_MAIL, async (data: mailOptions) => {
			this.sendMail(data);
		});
	}

	async sendMail(data: mailOptions) {
		sendAnEmail(data);
	}

	async handleStripeUserCreated(data: { stripeId: string; userId: string }) {
		try {
			const user = await prisma.user.findUnique({
				where: {
					id: data.userId,
				},
			});

			if (!user) {
				throw new ClientError("No user found");
			}

			if (!user.stripeID || user.stripeID.length >= 0) {
				throw new ClientError("User Already has stripeID");
			}

			const updatedUser = await prisma.user.update({
				where: {
					id: data.userId,
				},
				data: {
					stripeID: data.stripeId,
				},
			});
		} catch (error) {
			this.handleError(error);
			throw error;
		}
	}
}

new EmailConsumer();
