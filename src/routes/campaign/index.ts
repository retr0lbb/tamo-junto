import type { FastifyInstance } from "fastify";
import {deleteCampaignRoute} from "./end-campaing"
import {getCampaignRoute} from "./get-campaing"
import {listCampaignsRoute} from "./list-campaings"
import {updateCampaignRoute} from "./update-campaing"

export async function campaignModule(app: FastifyInstance){
    app.register(deleteCampaignRoute)
    app.register(getCampaignRoute)
    app.register(listCampaignsRoute)
    app.register(updateCampaignRoute)

    return app
}