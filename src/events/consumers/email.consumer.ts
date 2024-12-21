import { type mailOptions, sendAnEmail } from "../../lib/mailtransport";
import { messageBroker } from "../message-broker";

class EmailConsumer {
	constructor() {
		messageBroker.on("send-mail", async (data: mailOptions) => {
			this.sendMail(data);
		});
	}

	async sendMail(data: mailOptions) {
		sendAnEmail(data);
	}
}

new EmailConsumer();
