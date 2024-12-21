import type { PrismaClient } from "@prisma/client";
import { ClientError } from "../_errors/clientError";
import { NotFound } from "../_errors/notFoundError";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class Campaing {
	static async createCampaing(
		db: PrismaClient,
		data: { name: string; Userid: string; goal: number },
	) {
		await db.user.findUniqueOrThrow({
			where: {
				id: data.Userid,
			},
		});

		const result = await db.campaing.create({
			data: {
				goal: data.goal,
				name: data.name,
				Userid: data.Userid,
			},
		});

		return result;
	}

	static async deleteCampaing(
		db: PrismaClient,
		data: { id: string; userId: string },
	) {
		try {
			const campaing = await db.campaing.findUnique({
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

			if (!campaing) {
				throw new NotFound("Campaing not found");
			}

			if (data.userId !== campaing.Userid) {
				throw new ClientError(
					"Cannot delete a campaing thats not created by you",
				);
			}

			const result = await db.campaing.delete({
				where: {
					id: data.id,
				},
			});

			return result;
		} catch (error) {
			// biome-ignore lint/complexity/noUselessCatch: <explanation>
			throw error;
		}
	}

	static async getCampaing(db: PrismaClient, data: { id: string }) {
		const result = await db.campaing.findUnique({
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

	static async verifyIfCampaingExists(db: PrismaClient, data: { id: string }) {
		const exits = await db.campaing.findUnique({
			where: {
				id: data.id,
			},
		});

		return exits;
	}

	static async getCampaingsByPage(
		db: PrismaClient,
		{ page = 0, user = undefined }: { page?: number; user?: string },
	) {
		const resultsPerPage = 10;
		const campaings = await db.campaing.findMany({
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

	static async updateCampaing(
		db: PrismaClient,
		data: { id: string; name: string; goal: number },
	) {
		const updatedCampaing = await db.campaing.update({
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
