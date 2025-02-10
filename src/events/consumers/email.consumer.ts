import { ClientError } from "../../_errors/clientError";
import { type mailOptions, sendAnEmail } from "../../lib/mailtransport";
import { prisma } from "../../lib/prisma";
import { messageBroker } from "../message-broker";

// TODO se if i can organize this files to 2 single files or a better folder sistem
// TODO add RabbitMQ using docker to send messages

class EmailConsumer {
	constructor() {
		messageBroker.on("send-mail", async (data: mailOptions) => {
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
			console.log(error);
			throw error;
		}
	}
}

new EmailConsumer();
