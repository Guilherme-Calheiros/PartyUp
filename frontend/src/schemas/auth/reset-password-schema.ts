import { z } from "zod"
import { passwordSchema } from "./password-schema"

const baseResetPasswordSchema = z.object({
    email: z.email("E-mail inválido."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme sua senha."),
})

export const resetPasswordSchema = baseResetPasswordSchema.refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "As senhas não coincidem.",
        path: ["confirmPassword"],
        when(payload) {
            return baseResetPasswordSchema
                .pick({ password: true, confirmPassword: true })
                .safeParse(payload.value).success
        },
    }
)

export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>
