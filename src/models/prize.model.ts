import type { PrismaClient } from "@prisma/client";

interface createPrizePayload {
	milestoneId: string;
	uri: "http://localhost:3333";
	title: string;
	description: string | null;
	isShippingPrize: boolean;
}

export class PrizeModel {
	constructor(private db: PrismaClient) {}

	async createPrize(data: createPrizePayload) {
		const prize = await this.db.prize.create({
			data: {
				description: data.description ?? "",
				title: data.title,
				uri: data.uri,
				isShippingPrize: data.isShippingPrize,
				Milestoneid: data.milestoneId,
			},
		});

		return prize;
	}
}
