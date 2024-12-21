import { messageBroker } from "../message-broker";

export interface Milestone {
	id: string;
	objectiveAmmount: number;
	minDonation: number;

	prize: [];

	Campaingid: string;
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class MilestoneEvent {
	static emitCheckIfDonationCompletesMilestone(donationId: string) {
		messageBroker.emit("milestone-complete", donationId);
	}

	static emitAddWinners(data: { milestoneId: string }) {
		messageBroker.emit("add-winners", data);
	}
}

export default MilestoneEvent;
