import z from "zod";

export const createUserPayloadDTO = z.object({
    addressInfo: z.uuid().optional(),
    email: z.email(),
    name: z.string().nonempty(),
    password: z.string().nonempty()
})

export type CreateUserPayload = z.infer<typeof createUserPayloadDTO>