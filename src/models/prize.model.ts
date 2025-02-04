import type { PrismaClient } from "@prisma/client";
import { throws } from "node:assert";
import { ClientError } from "../_errors/clientError";
import { NotFound } from "../_errors/notFoundError";

export class PrizeModel {
	constructor(private db: PrismaClient) {}

	async createPrize(data: {
		name: string;
		description: string;
		prizeData?: string;
		milestoneId: string;
	}) {
		const prizeWithSameUri = await this.db.prize.findFirst({
			where: {
				prizeData: data.prizeData,
			},
		});

		if (prizeWithSameUri) {
			throw new ClientError("Already exists this prize");
		}

		const milestone = await this.db.milestone.findUnique({
			where: {
				id: data.milestoneId,
			},
		});

		if (!milestone) {
			throw new NotFound("Milestone not found");
		}

		const prize = await this.db.prize.create({
			data: {
				description: data.description,
				name: data.name,
				prizeData: data.prizeData,
				Milestoneid: data.milestoneId,
			},
		});

		return prize;
	}
}
