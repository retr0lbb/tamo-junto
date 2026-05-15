import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { requestUser } from "../../lib/request-user-jwt";

export async function campaignModule(app: FastifyInstance){
    app.register(createCampaignRoute, {prefix: "/campaign"})
}

const createCampaignSchema = z.object({
    campaignName: z.string().nonempty(),
    campaignObjectiveAmount: z.number().positive(),
});

async function createCampaignRoute(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().post("/",{schema: {
        body: createCampaignSchema,
        summary: "create an campaign from a user"
    }}, async(req, res) => {
        const {campaignName, campaignObjectiveAmount} = req.body
        const { id: userId } = requestUser.parse(req.user);

        //Process using ada, 0 down time

        res.status(202).send({message: "campaign received"})
    })
}