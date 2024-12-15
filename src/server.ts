import { fastify } from "fastify"


const app = fastify()
app.get("/", (request, reply) => {
    reply.send("Api funcionando com sucesso")
})

app.listen({
    port: 3333,
}).then(() => {
    console.log("Server running on port 3333")
}).catch(err => console.log(err))