import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "./env";

export default fp(async (app) => {
	app.register(jwt, { secret: env.TOKEN_SECRET });

	app.decorate(
		"authenticate",
		async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				await request.jwtVerify();
			} catch (err) {
				reply.code(401).send({ message: "Unauthorized" });
				console.log(err);
			}
		},
	);
});
