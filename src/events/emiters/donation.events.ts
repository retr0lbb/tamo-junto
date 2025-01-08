import { messageBroker } from "../message-broker";
import type { mailOptions } from "../../lib/mailtransport";

export interface Milestone {
	id: string;
	objectiveAmmount: number;
	minDonation: number;

	prize: [];

	Campaingid: string;
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class donationEvent {
	static emitCheckIfMilestoneIsCompleted(
		campaingId: string,
		totalDonatedValue: number,
	) {
		console.log("Emmiting check-milestone-completion please see if 💸");
		messageBroker.emit("check-milestone-completion", {
			campaingId,
			totalDonatedValue,
		});
	}
	static sendEmail(data: mailOptions) {
		messageBroker.emit("send-mail", data);
	}
}

export default donationEvent;
