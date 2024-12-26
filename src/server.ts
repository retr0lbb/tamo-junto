import { fastify } from "fastify";
import { createUserRoute } from "./routes/user/create-user";
import { createCampaingRoute } from "./routes/campaing/create-campaing";
import { createMilestoneRoute } from "./routes/milestones/create-milestone-for-campaing";
import { createDonationRoute } from "./routes/donations/donate-to-campaing";
import { getCampaingRoute } from "./routes/campaing/get-campaing";
import { createPrizeRoute } from "./routes/prize/add-prize-to-milestone";
import { loginUserRoute } from "./routes/user/login-user";
import { listCampaingsRoute } from "./routes/campaing/list-campaings";
import { deleteCampaingRoute } from "./routes/campaing/end-campaing";
import { updateCampaingRoute } from "./routes/campaing/update-campaing";
import { getMilestoneWinnersRoute } from "./routes/milestones/get-milestone-winners";
import plugin from "./lib/jwt-plugin";
import "./events/consumers/milestone.consumer";
import "./events/consumers/email.consumer";
import { getUserDonatiosRoute } from "./routes/user/get-user-donations";
import { ErrorHandler } from "./_errors/error-handler";
import { deleteUserRoute } from "./routes/user/delete-user";
import { CreateStripeUserRoute } from "./routes/user/create-stripe-user";
import { ListenWebHookRoute } from "./webhooks/webhook";

const app = fastify({
	connectionTimeout: 10000, // 10 segundos
	// https: {
	// 	key: fs.readFileSync("./server.key"),
	// 	cert: fs.readFileSync("./server.crt"),
	// },
});
app.register(plugin);
app.get("/", (request, reply) => {
	reply.send("Api funcionando com sucesso");
});

app.setErrorHandler(ErrorHandler);

app.register(createUserRoute);
app.register(loginUserRoute);
app.register(createCampaingRoute);
app.register(createMilestoneRoute);
app.register(createDonationRoute);
app.register(getCampaingRoute);
app.register(createPrizeRoute);
app.register(listCampaingsRoute);
app.register(deleteCampaingRoute);
app.register(updateCampaingRoute);
app.register(getMilestoneWinnersRoute);
app.register(getUserDonatiosRoute);
app.register(deleteUserRoute);
app.register(CreateStripeUserRoute);
app.register(ListenWebHookRoute);

app
	.listen({
		port: 3333,
	})
	.then(() => {
		console.log("Server running on port 3333");
	})
	.catch((err) => console.log(err));
