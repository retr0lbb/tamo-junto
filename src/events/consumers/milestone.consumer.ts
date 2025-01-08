import { ServerError } from "../../_errors/serverError";
import { prisma } from "../../lib/prisma";
import donationEvent from "../emiters/donation.events";
import { messageBroker } from "../message-broker";
import MilestoneEvent from "../emiters/milestone.evets";

class MilestoneConsumer {
	constructor() {
		console.log("this listener is ready to recive messages");
		messageBroker.on(
			"check-milestone-completion",
			async (data: { campaingId: string; totalDonatedValue: number }) => {
				console.log("Recived message processing users 💸");
				await this.verifyIfMilestoneIsAchived({
					campaingId: data.campaingId,
					totalDonationValue: data.totalDonatedValue,
				});
			},
		);
		messageBroker.on("add-winners", async (data: { milestoneId: string }) => {
			await this.createMilestonesWinners(data);
		});
	}

	private async createMilestonesWinners(data: {
		milestoneId: string;
	}) {
		try {
			const milestone = await prisma.milestone.findUnique({
				where: {
					id: data.milestoneId,
				},
			});

			if (!milestone) {
				return;
			}

			const campaing = await prisma.campaing.findUnique({
				where: {
					id: milestone.Campaingid ?? "",
				},
			});

			if (!campaing) {
				return;
			}

			const donators = await prisma.user.findMany({
				where: {
					Donations: {
						some: {
							Campaingid: campaing.id,
						},
					},
				},
				include: {
					Donations: {
						where: {
							status: true,
						},
					},
				},
			});

			donators.map(async (donator) => {
				const donatorTotalValue = donator.Donations.reduce(
					(acc, item) => acc + item.donationAmmount.toNumber(),
					0,
				);

				if (donatorTotalValue >= milestone.objectiveAmmount.toNumber()) {
					await prisma.userAchievedMilestone.create({
						data: {
							Userid: donator.id,
							Milestoneid: milestone.id,
						},
					});
					donationEvent.sendEmail({
						subject: `Congratulations ${donator.name}`,
						text: "you have earned a milestone prize",
						html: `<h1>Milestone prize</h1>
						<div>by this time you have donated enough money to earn a 
						milestone prize for the campaing <strong>${campaing.name}</strong></div>
						<p>See more information on our website <a href="http://localhost:3333">link</a></p>
						`,
					});
				}
			});
		} catch (error) {
			throw new ServerError(
				"An error occured when processing milestones winners",
			);
		}
	}

	private async verifyIfMilestoneIsAchived({
		campaingId,
		totalDonationValue,
	}: { campaingId: string; totalDonationValue: number }) {
		try {
			console.log("Hey this triggered");
			const milestonesInOrderOfCompletion = await prisma.milestone.findMany({
				where: {
					Campaingid: campaingId,
					isCompleted: false,
				},
				orderBy: {
					objectiveAmmount: "asc",
				},
			});

			console.log(milestonesInOrderOfCompletion);
			console.log(totalDonationValue);

			if (milestonesInOrderOfCompletion.length <= 0) {
				return;
			}
			if (milestonesInOrderOfCompletion[0].isCompleted === true) {
				throw new ServerError("Milestone already completed");
			}
			if (!milestonesInOrderOfCompletion[0]) {
				throw new Error("Milestone not found");
			}

			if (
				totalDonationValue >=
				milestonesInOrderOfCompletion[0].objectiveAmmount.toNumber()
			) {
				await prisma.milestone.update({
					data: {
						isCompleted: true,
					},
					where: {
						id: milestonesInOrderOfCompletion[0].id,
					},
				});
				MilestoneEvent.emitAddWinners({
					milestoneId: milestonesInOrderOfCompletion[0].id,
				});
			}
		} catch (error) {
			console.log(error);
			throw error;
		}
	}
}

new MilestoneConsumer();
