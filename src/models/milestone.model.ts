import type { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { NotFound } from "../_errors/notFoundError";
import { ClientError } from "../_errors/clientError";

interface MilestoneProps {
	name: string;
	description: string | null;
	minDonation: number | null;
	objectiveAmmount: number;
}

export class MilestoneModel {
	constructor(private db: PrismaClient) {}

	async getMilestone({ id }: { id: string }) {
		const milestone = await this.db.milestone.findUnique({
			where: {
				id,
			},
		});

		if (!milestone) {
			throw new ClientError("Cannot get milestone");
		}

		return milestone;
	}

	async getMilestonesByCampaingId({ id }: { id: string }) {
		const milestones = await this.db.milestone.findMany({
			where: {
				Campaingid: id,
			},
		});

		return milestones;
	}

	async createMilestone(
		data: MilestoneProps & { campaingId: string; userId: string },
	) {
		try {
			const campaing = await prisma.campaing.findUnique({
				where: {
					id: data.campaingId,
				},
			});

			if (!campaing) {
				throw new NotFound("Campaing not found");
			}

			if (campaing.Userid !== data.userId) {
				throw new ClientError(
					"You can't create a milestone on an Campaing thats not yours",
				);
			}

			if (campaing.goal.comparedTo(data.objectiveAmmount) <= -1) {
				throw new ClientError(
					"Can't create a milestone that surpass the campaing goal!",
				);
			}

			if (
				data.minDonation !== null &&
				campaing.goal.comparedTo(data.minDonation) <= -1
			) {
				throw new ClientError(
					"Can't add a minimum value that's over the campaing goal",
				);
			}

			const [donatios, existisMilestone] = await Promise.all([
				this.db.donation.findMany({
					where: {
						Campaingid: data.campaingId,
					},
					select: {
						donationAmmount: true,
					},
				}),
				this.db.milestone.findUnique({
					where: {
						campaing_milestone_cap: {
							objectiveAmmount: data.objectiveAmmount,
							Campaingid: data.campaingId,
						},
					},
				}),
			]);

			if (existisMilestone !== null) {
				throw new ClientError(
					"A milestone with this objective already exists in this campaing",
				);
			}

			const totalDonationsSum = donatios.reduce(
				(acc, item) => acc + item.donationAmmount.toNumber(),
				0,
			);

			if (totalDonationsSum >= data.objectiveAmmount) {
				throw new ClientError(
					"Cannot create a milestone objective that's lower than total collected money",
				);
			}

			console.log("total sum of donations: ", totalDonationsSum);

			const milestone = await this.db.milestone.create({
				data: {
					minDonation: data.minDonation ?? 0,
					objectiveAmmount: data.objectiveAmmount,
					name: data.name,
					Campaingid: data.campaingId,
					description: data.description,
				},
			});

			return milestone;
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	async verifyIfThisMilestoneDontAlreadyExists({
		goal,
		campaingId,
	}: { goal: number; campaingId: string }) {
		const milestones = await this.db.milestone.findFirst({
			where: { Campaingid: campaingId, objectiveAmmount: goal },
		});

		return milestones;
	}

	async getMilestoneWinners(milestoneID: string) {
		try {
			const winners = await this.db.prizedWinnedByUsers.findMany({
				where: {
					Milestoneid: milestoneID,
				},
				include: {
					User: {
						include: {
							Donations: true,
						},
					},
				},
			});

			if (winners.length <= 0) {
				return [];
			}

			const data = winners.map((winner) => {
				if (winner.User) {
					return {
						winnerName: winner.User.name,
						winnerEmail: winner.User.email,
						addressInfo: winner.User.addressInfo,
						donations: winner.User.Donations.reduce(
							(acc, item) => acc + item.donationAmmount.toNumber(),
							0,
						),
					};
				}
			});

			return data;
		} catch (error) {
			throw new Error("An error occured at get milestone winners");
		}
	}
}
