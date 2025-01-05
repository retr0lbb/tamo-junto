import type { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import { ClientError } from "../_errors/clientError";
import { prisma } from "../lib/prisma";
interface UserInterface {
	addressInfo: string | null;
	email: string;
	name: string;
	password: string;
}

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

	async createUser({ addressInfo, email, name, password }: UserInterface) {
		const isUserInDatabaseAlready = await this.db.user.findUnique({
			where: {
				email,
			},
		});

		if (isUserInDatabaseAlready !== null) {
			throw new ClientError("An user with this email already exists");
		}

		const insertedUser = await this.db.user.create({
			data: {
				email,
				name,
				password,
				addressInfo: addressInfo ? addressInfo : null,
			},
			select: {
				id: true,
			},
		});

		return insertedUser;
	}

	async logInUser({
		email,
		password,
	}: Omit<UserInterface, "addressInfo" | "name">) {
		try {
			const user = await this.db.user.findUnique({
				where: {
					email: email,
				},
			});

			if (!user) {
				throw new Error("User not found");
			}

			const match = await compare(password, user.password);

			if (match === false) {
				throw new ClientError("Password didn't match!");
			}

			return user;
		} catch (error) {
			// biome-ignore lint/complexity/noUselessCatch: <explanation>
			throw error;
		}
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
