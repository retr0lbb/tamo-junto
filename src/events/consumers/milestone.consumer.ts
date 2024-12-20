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

			if (!milestonesInOrderOfCompletion) {
				return;
			}
			if (milestonesInOrderOfCompletion[0].isCompleted === true) {
				return;
			}

			if (
				totalDonationValue >=
				milestonesInOrderOfCompletion[0].objectiveAmmount.toNumber()
			) {
				const donators = await prisma.user.findMany({
					where: {
						Donations: {
							some: {
								Campaingid: campaingId,
							},
						},
					},
					include: {
						Donations: true,
					},
				});

				donators.map(async (donator) => {
					const userDonationValue = donator.Donations.reduce(
						(acc, item) => acc + item.donationAmmount.toNumber(),
						0,
					);

					if (
						userDonationValue >=
						milestonesInOrderOfCompletion[0].minDonation.toNumber()
					) {
						const result = await prisma.userAchievedMilestone.create({
							data: {
								Milestoneid: milestonesInOrderOfCompletion[0].id,
								Userid: donator.id,
							},
						});
					}
				});

				await prisma.milestone.update({
					data: {
						isCompleted: true,
					},
					where: {
						id: milestonesInOrderOfCompletion[0].id,
					},
				});
			}
		} catch (error) {
			console.log(error);
			throw new Error("an error occured");
		}
	}
}

new MilestoneConsumer();
