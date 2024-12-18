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
	static emitMilestoneAchieved(milestone: Milestone) {
		messageBroker.emit("milestone-achived", { milestone });
		console.log(
			"message Emmited to: ",
			messageBroker.listeners("milestone-achived"),
		);
	}
}

export default CampaingEvent;
