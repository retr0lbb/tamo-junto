import type { PrismaClient } from "../../generated/prisma/client";
import { compare } from "bcrypt";
import { ClientError } from "../_errors/clientError";
import { prisma } from "../lib/prisma";


export class UserModel {
	constructor(private db: PrismaClient) {}

	async gerUserDonations({ id }: { id: string }) {
		const user = await this.db.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new ClientError("User cannot be found");
		}

		const donations = await this.db.campaing.findMany({
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


	async deleteUser(data: { id: string }) {
		const user = await this.db.user.findUnique({
			where: { id: data.id },
		});

		if (!user) {
			throw new ClientError("Cannot delete user that doesn't exits");
		}

		await prisma.user.delete({
			where: {
				id: data.id,
			},
		});

		return true;
	}
}
