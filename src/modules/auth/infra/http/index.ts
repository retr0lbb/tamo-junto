import type { FastifyInstance } from "fastify";
import {createUserRoute} from "./create-user"
import {loginUserRoute} from "./login-user"


export async function AuthModuleRoutes(app: FastifyInstance){
    app.register(createUserRoute)
    app.register(loginUserRoute)
}