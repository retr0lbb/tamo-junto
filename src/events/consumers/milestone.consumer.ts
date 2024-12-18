import type { Milestone } from "../emiters/campaing.events";
import { messageBroker } from "../message-broker";

class MilestoneConsumer {
	constructor() {
		messageBroker.on("milestone-achived", () =>
			console.log("hey this milestone was achived"),
		);
	}

	private handleMilestoneAchieved(event: Milestone) {
		console.log(`milestone with id ${event.id} achieved`);
	}
}

new MilestoneConsumer();
