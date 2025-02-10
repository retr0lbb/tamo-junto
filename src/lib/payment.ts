import { Stripe } from "stripe";
import { env } from "./env";
import { prisma } from "./prisma";

export const stripeClient = new Stripe(env.STRIPE_KEY, {
	typescript: true,
});

// TODO Fix this function using real stripe taxes for US
export function calculateReducedFee(
	amountInCents: number,
	stripeFeePercentage = 0.029,
	stripeFixedFeeInCents = 50,
	reducedFeePercentage = 0.01,
) {
	const stripeFees =
		Math.ceil(amountInCents * stripeFeePercentage) + stripeFixedFeeInCents;

	// Calcula a taxa reduzida (sua comissão)
	let reducedFee = Math.ceil(
		(amountInCents - stripeFees) * reducedFeePercentage,
	);

	// Garante que a reducedFee nunca será menor que stripeFees
	if (reducedFee < stripeFees) {
		reducedFee = Math.ceil(stripeFees * 1.01);
	}

	return { reducedFee, stripeFees };
}

// TODO Organize this code so its more readable
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
		console.log(`valor da taxa da plataforma reduzida ${reducedFee}`);
		const paymentSession = await stripeClient.checkout.sessions.create({
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

			// TODO to search if it has a better way to do this
			payment_intent_data: {
				application_fee_amount: reducedFee,
				transfer_data: {
					destination: campaingOwnerStripeId,
				},
			},
			// TODO see what is the porpouse of this sucess and cancel url
			mode: "payment",
			success_url: "https://youtube.com",
			cancel_url: "https://e621.net",
		});

		return paymentSession;
	} catch (error) {
		console.error("Erro ao criar a sessão de pagamento:", error);
		throw new Error("Não foi possível criar a sessão de pagamento.");
	}
}

interface createStripeRelatedUserParams {
	userId: string;
	email: string;
	firstName: string;
	lastName: string;
	originForward: string;
	originRefresh: string;
}

// TODO se if i can optimize this function

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
