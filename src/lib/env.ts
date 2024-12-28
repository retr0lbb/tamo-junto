import z from "zod";

const envSchema = z.object({
	TOKEN_SECRET: z.string().min(1),
	DATABASE_URL: z.string().min(1),
	GMAIL_PASS: z.string().min(1),
	MERCADOPAGO_TEST_KEY: z.string().min(1),
	MERCADOPAGO_PUBLIC_KEY: z.string().min(1),
	STRIPE_KEY: z.string().min(1),
	STRIPE_WEBHOOK_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);
