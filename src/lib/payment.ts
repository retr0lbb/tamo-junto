import { Stripe } from "stripe";
import { env } from "./env";
import { never } from "zod";

const stripeClient = new Stripe(env.STRIPE_KEY, {});

interface Props extends Stripe.PaymentIntentCreateParams {}

export async function generatePaymentIntent(props: Props) {
	const paymentIntent = await stripeClient.paymentIntents.create({
		...props,
	});

	return paymentIntent;
}

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
