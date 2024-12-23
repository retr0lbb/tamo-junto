import { MercadoPagoConfig, Payment } from "mercadopago";
import { env } from "./env";
import type { PaymentCreateData } from "mercadopago/dist/clients/payment/create/types";

const mercadoPagoClient = new MercadoPagoConfig({
	accessToken: env.MERCADOPAGO_TEST_KEY,
	options: { timeout: 5000 },
});

const payment = new Payment(mercadoPagoClient);

export async function createPaymentByCard({
	body,
	requestOptions,
}: PaymentCreateData) {
	try {
		const result = await payment.create({ body, requestOptions });
		console.log(result);
		return result;
	} catch (error) {
		console.error("Error creating payment:", error);
		throw error;
	}
}
