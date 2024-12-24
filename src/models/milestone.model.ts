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

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class Milestone {
	static async getMilestone(db: PrismaClient, { id }: { id: string }) {
		const milestone = await db.milestone.findUniqueOrThrow({
			where: {
				id,
			},
		});

		return milestone;
	}
	static async getMilestonesByCampaingId(
		db: PrismaClient,
		{ id }: { id: string },
	) {
		const milestones = await db.milestone.findMany({
			where: {
				Campaingid: id,
			},
		});

		return milestones;
	}

	static async createMilestone(
		db: PrismaClient,
		data: MilestoneProps & { campaingId: string; userId: string },
	) {
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

		if (campaing.goal.comparedTo(data.objectiveAmmount) === -1) {
			throw new ClientError(
				"Can't create a milestone that surpass the campaing goal!",
			);
		}

		if (
			data.minDonation !== null &&
			campaing.goal.comparedTo(data.minDonation) === -1
		) {
			throw new ClientError(
				"Can't add a minimum value that's over the campaing goal",
			);
		}

		const [donatios, existisMilestone] = await Promise.all([
			db.donation.findMany({
				where: {
					Campaingid: data.campaingId,
				},
				select: {
					donationAmmount: true,
				},
			}),
			db.milestone.findUnique({
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
			return new ClientError(
				"Cannot create a milestone objective that's lower than total collected money",
			);
		}

		const milestone = await db.milestone.create({
			data: {
				minDonation: data.minDonation ?? 0,
				objectiveAmmount: data.objectiveAmmount,
				name: data.name,
				Campaingid: data.campaingId,
				description: data.description,
			},
		});

		return milestone;
	}

	static async verifyIfThisMilestoneDontAlreadyExists(
		db: PrismaClient,
		{ goal, campaingId }: { goal: number; campaingId: string },
	) {
		const milestones = await db.milestone.findFirst({
			where: { Campaingid: campaingId, objectiveAmmount: goal },
		});

		return milestones;
	}
}
