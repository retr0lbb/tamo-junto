import { describe, it, expect, vi, beforeEach } from "vitest";
import { CampaingModel } from "./campaing.model";
import type { prisma } from "../lib/prisma";
import { ClientError } from "../_errors/clientError";
import { NotFound } from "../_errors/notFoundError";

interface CampaingProps {
	id: string;
	name: string;
	goal: number;
	Userid: string | null;
}

describe("Campaing Model Testcase Create", () => {
	let prismaMock: typeof prisma;

	beforeEach(() => {
		prismaMock = {
			campaing: {
				create: vi.fn().mockResolvedValue({
					id: "123",
					name: "Test Campaing",
					goal: 1000,
					Userid: "user-123",
				}),
				findFirst: vi.fn().mockResolvedValue(null),
				findMany: vi.fn().mockResolvedValue([]),
			},
			user: {
				findUnique: vi.fn().mockResolvedValue({
					id: "user-123",
					name: "Joe Doe",
					email: "joe@mail.com",
					password: "123123",
					addressInfo: "Sponner Street SP 11 Avenue",
					stripeID: "stripe_valid_id",
				}),
			},
		} as unknown as typeof prisma;
	});

	it("Should create campaing sucessfully", async () => {
		const createdCampaing = await new CampaingModel(prismaMock).createCampaing({
			goal: 1000,
			name: "Test Campaing",
			Userid: "user-123",
		});

		expect(createdCampaing).toEqual({
			id: "123",
			name: "Test Campaing",
			goal: 1000,
			Userid: "user-123",
		});
	});

	it("Should return error if already have the same campaing", async () => {
		prismaMock.campaing.findFirst = vi.fn().mockResolvedValue({
			id: "some-other-id",
			goal: 2000,
			name: "other-name",
			Userid: "otherUserId",
		} as CampaingProps);

		expect(() => {
			new CampaingModel(prismaMock).createCampaing({
				name: "Test Campaing",
				goal: 1000,
				Userid: "user-123",
			});
		}).toBeTypeOf(typeof ClientError);
	});

	it("Should Return Error if User doesn't have an stripeId", async () => {
		prismaMock.user.findUnique = vi.fn().mockResolvedValue({
			id: "userId",
			name: "user name",
			email: "user email",
			password: "123123",
			stripeID: null,
		});

		expect(() => {
			new CampaingModel(prismaMock).createCampaing({
				name: "Test Campaing",
				goal: 1000,
				Userid: "user-123",
			});
		}).toBeTypeOf(typeof ClientError);
	});

	it("Should return error if user don't exists", async () => {
		prismaMock.user.findUnique = vi.fn().mockResolvedValue(null);

		expect(() => {
			new CampaingModel(prismaMock).createCampaing({
				name: "Test Campaing",
				goal: 1000,
				Userid: "user-123",
			});
		}).toBeTypeOf(typeof NotFound);
	});
});
