import type { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
interface UserInterface {
	addressInfo: string | null;
	email: string;
	name: string;
	password: string;
}

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

	static async createUser(
		db: PrismaClient,
		{ addressInfo, email, name, password }: UserInterface,
	) {
		const isUserInDatabaseAlready = await db.user.findUnique({
			where: {
				email,
			},
		});

		if (isUserInDatabaseAlready !== null) {
			throw new Error("User already exists");
		}

		const insertedUser = await db.user.create({
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

	static async logInUser(
		db: PrismaClient,
		{ email, password }: Omit<UserInterface, "addressInfo" | "name">,
	) {
		const user = await db.user.findUnique({
			where: {
				email: email,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		const match = await compare(password, user.password);

		if (match === false) {
			throw new Error("Password Didnt match");
		}

		return user;
	}
}
