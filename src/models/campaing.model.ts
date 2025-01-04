import type { PrismaClient } from "@prisma/client";
import { ClientError } from "../_errors/clientError";
import { NotFound } from "../_errors/notFoundError";

export class Campaing {
	constructor(private db: PrismaClient) {}

	async createCampaing(data: { name: string; Userid: string; goal: number }) {
		const user = await this.db.user.findUniqueOrThrow({
			where: {
				id: data.Userid,
			},
		});

		if (!user.stripeID) {
			throw new ClientError(
				"You must create a stripe account to recive the campaing money",
			);
		}

		const result = await this.db.campaing.create({
			data: {
				goal: data.goal,
				name: data.name,
				Userid: data.Userid,
			},
		});

		return result;
	}

	async deleteCampaing(data: { id: string; userId: string }) {
		const campaing = await this.db.campaing.findUnique({
			where: {
				id: data.id,
			},
			select: { Userid: true },
		});

		if (!campaing) {
			throw new NotFound("Campaing not found");
		}

		if (data.userId !== campaing.Userid) {
			throw new ClientError(
				"Cannot delete a campaing thats not created by you",
			);
		}

		const result = await this.db.campaing.delete({
			where: {
				id: data.id,
			},
		});

		return result;
	}

	async getCampaing(data: { id: string }) {
		const result = await this.db.campaing.findUnique({
			where: {
				id: data.id,
			},
			select: {
				goal: true,
				id: true,
				name: true,
				Userid: true,
			},
		});

		return result;
	}

	async verifyIfCampaingExists(data: { id: string }) {
		const exits = await this.db.campaing.findUnique({
			where: {
				id: data.id,
			},
		});

		return exits;
	}

	async getCampaingsByPage({
		page = 0,
		user = undefined,
	}: { page?: number; user?: string }) {
		const resultsPerPage = 10;
		const campaings = await this.db.campaing.findMany({
			select: {
				id: true,
				name: true,
				goal: true,
			},
			where: {
				Userid: user ?? undefined,
			},
			take: resultsPerPage,
			skip: page * resultsPerPage,
		});

		return campaings;
	}

	async updateCampaing(data: { id: string; name: string; goal: number }) {
		const updatedCampaing = await this.db.campaing.update({
			where: {
				id: data.id,
			},
			data: {
				goal: data.goal,
				name: data.name,
			},
		});

		return updatedCampaing;
	}
}
