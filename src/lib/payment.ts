import { Stripe } from "stripe";
import { env } from "./env";
import { prisma } from "./prisma";

export const stripeClient = new Stripe(env.STRIPE_KEY, {});

function calculateReducedFee(
	amountInCents: number,
	stripeFeePercentage = 0.029,
	stripeFixedFeeInCents = 50,
	reducedFeePercentage = 0.005,
) {
	// Calcula o valor das taxas da Stripe
	const stripeFees =
		Math.ceil(amountInCents * stripeFeePercentage) + stripeFixedFeeInCents;

	// Calcula a taxa reduzida (sua comissão)
	let reducedFee = Math.ceil(
		(amountInCents - stripeFees) * reducedFeePercentage,
	);

	// Garante que a reducedFee nunca será menor que stripeFees
	if (reducedFee < stripeFees) {
		reducedFee = stripeFees;
	}

	// Calcula o valor líquido após todas as taxas
	const netAmount = amountInCents - stripeFees - reducedFee;

	return { netAmount, reducedFee, stripeFees };
}

export async function generatePaymentSession({
	amount,
	campaingOwnerStripeId,
	currency,
	campaingName,
}: {
	amount: number;
	campaingOwnerStripeId: string;
	currency: string;
	campaingName: string;
}) {
	try {
		const { reducedFee } = calculateReducedFee(amount * 100);
		const paymentSession = await stripeClient.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price_data: {
						currency: currency || "brl", // Moeda
						product_data: {
							name: campaingName,
							description:
								"Você está fazendo uma doação à campanha selecionada",
						},
						unit_amount: amount * 100, // Valor ajustado com as taxas
					},
					quantity: 1,
				},
			],
			payment_intent_data: {
				application_fee_amount: reducedFee,
				transfer_data: {
					destination: campaingOwnerStripeId,
				},
			},
			mode: "payment",
			success_url: "https://seusite.com/sucesso",
			cancel_url: "https://seusite.com/cancelamento",
		});

		return paymentSession;
	} catch (error) {
		console.error("Erro ao criar a sessão de pagamento:", error);
		throw new Error("Não foi possível criar a sessão de pagamento.");
	}
}

export interface GeneratePaymentIntentProps {
	amount: number;
	campaingOwnerStripeId: string;
	currency: "usd" | "brl";
}
export async function generatePaymentIntent({
	amount,
	campaingOwnerStripeId,
	currency,
}: GeneratePaymentIntentProps) {
	try {
		const paymentIntent = await stripeClient.paymentIntents.create(
			{
				amount: amount * 100,
				currency,
				payment_method_types: ["card"],
				application_fee_amount: Math.round(amount * 100 * 0.005),
				transfer_data: {
					destination: campaingOwnerStripeId,
				},
			},
			{ timeout: 10000 },
		);

		return paymentIntent;
	} catch (error) {
		console.log(error);
		throw new Error("Não foi possível criar o PaymentIntent.");
	}
}

export async function confirmPaymentIntent(data: {
	paymentIntentId: string;
	payment_method: string;
}) {
	try {
		const confirmedIntent = await stripeClient.paymentIntents.confirm(
			data.paymentIntentId,
		);
	} catch (error) {
		console.log(error);
		throw error;
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
