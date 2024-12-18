import { fastify } from "fastify";
import { createUserRoute } from "./routes/user/create-user";
import { createCampaingRoute } from "./routes/campaing/create-campaing";
import { createMilestoneRoute } from "./routes/milestones/create-milestone-for-campaing";
import { createDonationRoute } from "./routes/donations/donate-to-campaing";
import { getCampaingRoute } from "./routes/campaing/get-campaing";
import { createPrizeRoute } from "./routes/prize/add-prize-to-milestone";
import plugin from "./lib/jwt-plugin";
import { loginUserRoute } from "./routes/user/login-user";
import { listCampaingsRoute } from "./routes/campaing/list-campaings";
import { deleteCampaingRoute } from "./routes/campaing/end-campaing";

const app = fastify();
app.register(plugin);
app.get("/", (request, reply) => {
	reply.send("Api funcionando com sucesso");
});

app.register(createUserRoute);
app.register(loginUserRoute);
app.register(createCampaingRoute);
app.register(createMilestoneRoute);
app.register(createDonationRoute);
app.register(getCampaingRoute);
app.register(createPrizeRoute);
app.register(listCampaingsRoute);
app.register(deleteCampaingRoute);

app
	.listen({
		port: 3333,
	})
	.then(() => {
		console.log("Server running on port 3333");
	})
	.catch((err) => console.log(err));
