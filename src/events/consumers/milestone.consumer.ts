import { prisma } from "../../lib/prisma";
import { messageBroker } from "../message-broker";

class MilestoneConsumer {
	constructor() {
		console.log("this listener is ready to recive messages");
		messageBroker.on(
			"check-milestone-completion",
			async (data: { campaingId: string; totalDonatedValue: number }) => {
				await this.verifyIfMilestoneIsAchived({
					campaingId: data.campaingId,
					totalDonationValue: data.totalDonatedValue,
				});
			},
		);
	}

	private async verifyIfMilestoneIsAchived({
		campaingId,
		totalDonationValue,
	}: { campaingId: string; totalDonationValue: number }) {
		try {
			const milestonesInOrderOfCompletion = await prisma.milestone.findMany({
				where: {
					Campaingid: campaingId,
					isCompleted: false,
				},
				orderBy: {
					objectiveAmmount: "asc",
				},
			});

			if (
				totalDonationValue >=
				milestonesInOrderOfCompletion[0].objectiveAmmount.toNumber()
			) {
				console.log("Hey this milestone is completede shorty");
			}
		} catch (error) {
			throw new Error("an error occured");
		}
	}
}

new MilestoneConsumer();
