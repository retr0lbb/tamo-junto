import z from "zod";

export const loginUserPayloadDTO = z.object({
    email: z.email(),
    password: z.string().nonempty()
})

export type loginUserPayload = z.infer<typeof loginUserPayloadDTO>