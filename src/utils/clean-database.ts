import { prisma } from "../lib/prisma";

async function cleanDatabase() {
	await prisma.prize.deleteMany();
	await prisma.address.deleteMany();
	await prisma.milestone.deleteMany();
	await prisma.user.deleteMany();
	await prisma.donation.deleteMany();
	await prisma.prizedWinnedByUsers.deleteMany();
	await prisma.campaing.deleteMany();
}

cleanDatabase().finally(() => {
	console.log("Script executed with sucess");
});
