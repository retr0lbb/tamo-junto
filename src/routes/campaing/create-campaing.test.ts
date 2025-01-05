import { createCampaingHandler } from "./create-campaing";
import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../lib/prisma";

jest.mock("../../lib/prisma");

describe("Test create campaing route", () => {
	const request = {
		body: {},
	} as FastifyRequest;

	const reply = {
		status: jest.fn().mockReturnThis(),
		send: jest.fn(),
	} as unknown as FastifyReply;

	beforeEach(() => {
		request.body = {};
		request.user = {};
	});

	it("Should create a campaing sucessfully", async () => {
		request.body = {
			campaingName: "test",
			campaingObjectiveAmmount: 100,
		};
		request.user = { id: "c4748a40-f4f3-48aa-9e9a-0ca61eb54cef" };

		await createCampaingHandler(request, reply);

		expect(prisma.campaing.create).toHaveBeenCalledTimes(1);
		expect(prisma.campaing.create).toHaveBeenCalledWith({
			data: {
				goal: 100,
				name: "test",
				Userid: "c4748a40-f4f3-48aa-9e9a-0ca61eb54cef",
			},
		});
	});
});
