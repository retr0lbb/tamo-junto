import { fastify } from "fastify";
import { createUserRoute } from "./modules/auth/infra/http/create-user";
import { createMilestoneRoute } from "./routes/milestones/create-milestone-for-campaing";
import { createDonationRoute } from "./routes/donations/donate-to-campaing";
import { createPrizeRoute } from "./routes/prize/add-prize-to-milestone";
import { loginUserRoute } from "./modules/auth/infra/http/login-user";
import { getMilestoneWinnersRoute } from "./routes/milestones/get-milestone-winners";
import plugin from "./lib/jwt-plugin";
import "./events/consumers/milestone.consumer";
import "./events/consumers/email.consumer";
import { getUserDonatiosRoute } from "./routes/user/get-user-donations";
import { ErrorHandler } from "./_errors/error-handler";
import { deleteUserRoute } from "./routes/user/delete-user";
import { CreateStripeUserRoute } from "./routes/user/create-stripe-user";
import { ListenWebHookRoute } from "./webhooks/webhook";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { campaignModule } from "./routes/campaign";
import { AuthModuleRoutes } from "./modules/auth"
// TODO Organize this massive import list

// TODO add Type provider zod And swagger to document this api

// TODO create more tests and testcases to code

const app = fastify({
	connectionTimeout: 10000, // 10 segundos
	// https: {
	// 	key: fs.readFileSync("./server.key"),
	// 	cert: fs.readFileSync("./server.crt"),
	// },
});

app.register(import("fastify-raw-body"), {
	field: "rawBody",
	global: false,
	encoding: "utf-8",
	runFirst: true,
});
app.register(plugin);

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)


app.get("/", (_, reply) => {
	reply.send("Api funcionando com sucesso");
});

app.setErrorHandler(ErrorHandler);

app.register(campaignModule)
app.register(AuthModuleRoutes)

app.register(createUserRoute);
app.register(loginUserRoute);
app.register(createMilestoneRoute);
app.register(createDonationRoute);
app.register(createPrizeRoute);
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
