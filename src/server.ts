import { fastify } from "fastify";
import { createUserRoute } from "./routes/user/create-user";
import { createCampaingRoute } from "./routes/campaing/create-campaing";
import { createMilestoneRoute } from "./routes/milestones/create-milestone-for-campaing";

const app = fastify();

app.get("/", (request, reply) => {
	reply.send("Api funcionando com sucesso");
});

app.register(createUserRoute);
app.register(createCampaingRoute);
app.register(createMilestoneRoute);

app
	.listen({
		port: 3333,
	})
	.then(() => {
		console.log("Server running on port 3333");
	})
	.catch((err) => console.log(err));
