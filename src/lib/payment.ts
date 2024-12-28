import { Stripe } from "stripe";
import { env } from "./env";
import { never } from "zod";
import { availableMemory } from "node:process";
import { prisma } from "./prisma";

export const stripeClient = new Stripe(env.STRIPE_KEY, {});

interface Props extends Stripe.PaymentIntentCreateParams {}

export async function generatePaymentSession({
	campaingName,
	price,
}: { price: number; campaingName: string }) {
	const paymentSession = await stripeClient.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: [
			{
				price_data: {
					currency: "brl",
					product_data: {
						name: campaingName,
						description: "voce esta fazendo uma doacao a campanha selecionada",
					},
					unit_amount: price * 100,
				},
				quantity: 1,
			},
		],
		ui_mode: "embedded",
		mode: "payment",
		success_url: undefined,
		redirect_on_completion: "never",
	});

	return paymentSession;
}

export interface GeneratePaymentIntentProps {
	amount: number;
	userId: string;
	currency: "usd" | "brl";
}
export async function generatePaymentIntent({
	amount,
	userId,
	currency,
}: GeneratePaymentIntentProps) {
	try {
		const paymentIntent = await stripeClient.paymentIntents.create(
			{
				amount: amount * 100,
				currency,
				payment_method_types: ["card", "paypal", "google_pay", "apple_pay"],
				transfer_data: {
					destination: userId,
					amount: amount * 100,
				},
			},
			{ timeout: 10000 },
		);

		return paymentIntent;
	} catch (error) {
		console.log(error);
	}
}

interface createStripeRelatedUserParams {
	userId: string;
	email: string;
	firstName: string;
	lastName: string;
}

export async function createStripeRelatedUser({
	email,
	firstName,
	lastName,
	userId,
}: createStripeRelatedUserParams) {
	try {
		const user = await stripeClient.accounts.create({
			email,
			type: "custom",
			country: "BR",
			capabilities: {
				card_payments: { requested: true },
				transfers: { requested: true },
			},

			business_type: "individual",
			individual: {
				first_name: firstName,
				last_name: lastName,
			},
		});

		const [userStripeDatabase, accountLink] = await Promise.all([
			prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					stripeID: user.id,
				},
			}),
			stripeClient.accountLinks.create({
				account: user.id,
				type: "account_onboarding",
				return_url: "http://localhost:3333",
				refresh_url: "http://locahost:3333",
			}),
		]);

		return accountLink;
	} catch (error) {
		console.log(error);
		throw error;
	}
}
