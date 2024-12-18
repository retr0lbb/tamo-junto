import z from "zod";

export const requestUser = z.object({
	id: z.string().uuid(),
	iat: z.number(),
});
