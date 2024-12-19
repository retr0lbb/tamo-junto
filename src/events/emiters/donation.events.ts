import { messageBroker } from "../message-broker";

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
		messageBroker.emit("check-milestone-completion", {
			campaingId,
			totalDonatedValue,
		});
	}
}

export default donationEvent;
