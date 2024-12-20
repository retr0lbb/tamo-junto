import type { PrismaClient } from "@prisma/client";

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
