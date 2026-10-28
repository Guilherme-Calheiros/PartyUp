import { z } from "zod"
import { passwordSchema } from "./password-schema"

const baseRegisterSchema = z.object({
    username: z.string().trim().min(1, "Informe o nome de usuário."),
    email: z.email("E-mail inválido."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme sua senha."),
})

export const registerSchema = baseRegisterSchema.refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "As senhas não coincidem.",
        path: ["confirmPassword"],
        when(payload) {
            return baseRegisterSchema
                .pick({ password: true, confirmPassword: true })
                .safeParse(payload.value).success
        },
    }
)

export type RegisterRequest = z.infer<typeof registerSchema>
