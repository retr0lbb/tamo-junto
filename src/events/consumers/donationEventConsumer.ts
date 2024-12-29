import { ClientError } from "../../_errors/clientError";
import { type mailOptions, sendAnEmail } from "../../lib/mailtransport";
import { prisma } from "../../lib/prisma";
import { messageBroker } from "../message-broker";

class donationConsumer {
	constructor() {
		messageBroker.on("send-mail", async (data: mailOptions) => {});
	}
}

new donationConsumer();
