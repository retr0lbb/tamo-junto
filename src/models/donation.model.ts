import type { PrismaClient as PrismaClientDb } from "@prisma/client";
import { Prisma as PrismaClient } from "@prisma/client";
import { NotFound } from "../_errors/notFoundError";
import { ClientError } from "../_errors/clientError";
import donationEvent from "../events/emiters/donation.events";
import {
	confirmPaymentIntent,
	generatePaymentIntent,
	generatePaymentSession,
} from "../lib/payment";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class DonationModel {
	static async donateToCampaing(
		db: PrismaClientDb,
		data: { campaingId: string; userId: string; donnationAmmount: number },
	) {
		const campaing = await db.campaing.findUnique({
			where: {
				id: data.campaingId,
			},
			include: {
				User: true,
			},
		});

		if (!campaing || !campaing.User || !campaing.User.stripeID) {
			throw new NotFound("Campaing not founded");
		}

		if (campaing.Userid === data.userId) {
			throw new Error("Cannot donate to your own campaing");
		}

		const donationsArray = await db.donation.findMany({
			where: {
				Campaingid: data.campaingId,
			},
			select: {
				donationAmmount: true,
			},
		});

		const totalCollectedValueOfCampaing = donationsArray.reduce(
			(acc, donation) => {
				return acc.plus(donation.donationAmmount);
			},
			new PrismaClient.Decimal(0),
		);

		if (
			totalCollectedValueOfCampaing.comparedTo(campaing.goal) === 1 ||
			totalCollectedValueOfCampaing.comparedTo(campaing.goal) === 0
		) {
			throw new ClientError(
				"cannot donate to a campaing thats already completed",
			);
		}

		if (
			totalCollectedValueOfCampaing
				.plus(data.donnationAmmount)
				.comparedTo(campaing.goal) === 1
		) {
			throw new ClientError("Your donation will surpass the campaing goal.");
		}

		const user = await db.user.findUnique({
			where: {
				id: data.userId,
			},
			select: { email: true },
		});
		if (!user) {
			throw new ClientError("The user of this token no longer exits");
		}

		const [donation, paymentData] = await Promise.all([
			db.donation.create({
				data: {
					donationAmmount: data.donnationAmmount,
					Campaingid: data.campaingId,
					Userid: data.userId,
					status: false,
				},
			}),

			generatePaymentSession({
				amount: data.donnationAmmount,
				campaingName: campaing.name,
				campaingOwnerStripeId: campaing.User.stripeID,
				currency: "brl",
			}),
		]);

		donationEvent.emitCheckIfMilestoneIsCompleted(
			campaing.id,
			totalCollectedValueOfCampaing.toNumber() + data.donnationAmmount,
		);

		// donationEvent.sendEmail({
		// 	subject: "Donation complete",
		// 	text: `You sucessfully donated to ${campaing.name} with the value of R$ ${data.donnationAmmount}`,
		// 	to: user.email,
		// });

		return paymentData;
	}
}
