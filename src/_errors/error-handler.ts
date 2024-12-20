import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ClientError } from "./ClientError";
import { NotFound } from "./notFoundError";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const ErrorHandler: FastifyErrorHandler = (error, request, reply) => {
	if (error instanceof ZodError) {
		return reply
			.status(400)
			.send({ message: "Invalid Input", error: error.flatten().fieldErrors });
	}

	if (error instanceof ClientError) {
		return reply.status(400).send({ message: error.message });
	}
	if (error instanceof NotFound) {
		return reply.status(404).send({ message: error.message });
	}
};
