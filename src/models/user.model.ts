import type { PrismaClient } from "@prisma/client";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class UserModel {
	static async gerUserDonations(db: PrismaClient, { id }: { id: string }) {
		const user = await db.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new Error("User cannot be found");
		}

		const donations = await db.campaing.findMany({
			where: {
				donations: {
					some: {
						Userid: id,
					},
				},
			},
			select: {
				id: true,
				name: true,
				donations: {
					where: {
						Userid: id,
					},
					orderBy: {
						donationAmmount: "desc",
					},
				},
			},
			orderBy: {
				name: "asc",
			},
		});

		if (!donations) {
			return null;
		}

		return donations;
	}
}
