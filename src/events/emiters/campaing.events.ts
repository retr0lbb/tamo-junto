import { EventHandler } from "../event-handler";
import { EventNames } from "../events";

export interface Milestone {
	id: string;
	objectiveAmmount: number;
	minDonation: number;

	prize: [];

	Campaingid: string;
}

class CampaingEvent extends EventHandler {
	protected setUpListeners(): void {}

	emitMilestoneAchieved(milestone: Milestone) {
		if (!milestone) {
			throw new Error("Cannot send an empty milestone with the event");
		}
		this.emitEvent(EventNames.MILESTONE_ACHIEVED, milestone);
	}
}

export default new CampaingEvent();
