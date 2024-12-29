import type { PrismaClient as PrismaClientDb } from "@prisma/client";
import { Prisma as PrismaClient } from "@prisma/client";
import { NotFound } from "../_errors/notFoundError";
import { ClientError } from "../_errors/clientError";
import donationEvent from "../events/emiters/donation.events";
import { generatePaymentSession, calculateReducedFee } from "../lib/payment";
import { ServerError } from "../_errors/serverError";
import { prisma } from "../lib/prisma";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class DonationModel {
	static async donateToCampaing(
		db: PrismaClientDb,
		data: { campaingId: string; userId: string; donnationAmmount: number },
	) {
		try {
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
					taxfeeOfDonation: true,
				},
			});

			const totalCollectedValueOfCampaing = donationsArray.reduce(
				(acc, donation) => {
					return acc.plus(
						donation.donationAmmount.minus(
							donation.taxfeeOfDonation?.toNumber() ?? 0,
						),
					);
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

			const { reducedFee } = calculateReducedFee(data.donnationAmmount * 100);

			const paymentData = await generatePaymentSession({
				amount: data.donnationAmmount,
				campaingName: campaing.name,
				campaingOwnerStripeId: campaing.User.stripeID,
				currency: "brl",
			});

			const hasDonationWithStripeIdAlready = await prisma.donation.findUnique({
				where: {
					stripePaymentId: paymentData.id,
				},
			});

			if (hasDonationWithStripeIdAlready) {
				throw new ClientError(
					"An donation with this stripeId already exists call the owner of the website to resolve it",
				);
			}
			const donation = await db.donation.create({
				data: {
					donationAmmount: data.donnationAmmount,
					taxfeeOfDonation: reducedFee,
					Campaingid: data.campaingId,
					Userid: data.userId,
					status: false,
					stripePaymentId: paymentData.id,
				},
			});

			donationEvent.emitCheckIfMilestoneIsCompleted(
				campaing.id,
				totalCollectedValueOfCampaing.toNumber() + data.donnationAmmount,
			);

			console.log(paymentData.id);

			return paymentData;
		} catch (error) {
			throw new ServerError("Cannot process payment");
		}
	}
}
