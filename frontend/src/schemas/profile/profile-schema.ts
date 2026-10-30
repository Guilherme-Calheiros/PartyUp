import { z } from "zod"
import { passwordSchema } from "../auth/password-schema"

export const updateProfileSchema = z.object({
    userName: z
        .string()
        .trim()
        .min(1, "Informe o nome de usuário.")
        .max(50, "O nome de usuário deve ter no máximo 50 caracteres."),
})

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>

const baseChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme sua nova senha."),
})

export const changePasswordSchema = baseChangePasswordSchema.refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "As senhas não coincidem.",
        path: ["confirmPassword"],
        when(payload) {
            return baseChangePasswordSchema
                .pick({ newPassword: true, confirmPassword: true })
                .safeParse(payload.value).success
        },
    }
)

export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>
