import { messageBroker } from "../message-broker";

export interface Milestone {
	id: string;
	objectiveAmmount: number;
	minDonation: number;

	prize: [];

	Campaingid: string;
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class CampaingEvent {
	static emitCheckIfDonationCompletesMilestone(donationId: string) {
		messageBroker.emit("milestone-complete", donationId);
	}
}

export default CampaingEvent;
