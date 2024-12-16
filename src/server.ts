import { fastify } from "fastify";
import { createUserRoute } from "./routes/user/create-user";
import { createCampaingRoute } from "./routes/campaing/create-campaing";
import { createMilestoneRoute } from "./routes/milestones/create-milestone-for-campaing";
import { createDonationRoute } from "./routes/donations/donate-to-campaing";
import { getCampaingRoute } from "./routes/campaing/get-campaing";
import { createPrizeRoute } from "./routes/prize/add-prize-to-milestone";

const app = fastify();

app.get("/", (request, reply) => {
	reply.send("Api funcionando com sucesso");
});

app.register(createUserRoute);
app.register(createCampaingRoute);
app.register(createMilestoneRoute);
app.register(createDonationRoute);
app.register(getCampaingRoute);
app.register(createPrizeRoute);
app
	.listen({
		port: 3333,
	})
	.then(() => {
		console.log("Server running on port 3333");
	})
	.catch((err) => console.log(err));
