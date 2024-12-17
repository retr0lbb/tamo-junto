import z from "zod";

const envSchema = z.object({
	TOKEN_SECRET: z.string(),
	DATABASE_URL: z.string(),
});

export const env = envSchema.parse(process.env);
