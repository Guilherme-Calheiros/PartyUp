import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import InputPassword from "./ui/inputPassword"
import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useNavigate, useSearchParams } from "react-router"
import { resetPasswordSchema, type ResetPasswordRequest } from "@/schemas/auth/reset-password-schema"
import { toFieldErrors } from "@/schemas/utils"

export default function ResetPasswordForm({ ...props }: React.ComponentProps<typeof Card>) {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const token = searchParams.get("token")
    const email = searchParams.get("email") ?? ""

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordRequest, string>>>({})
    const [requestError, setRequestError] = useState<string | null>(null)
    const [isPasswordReset, setIsPasswordReset] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (resetPasswordRequest: ResetPasswordRequest) => {
        const result = resetPasswordSchema.safeParse(resetPasswordRequest)

        if (!result.success) {
            setErrors(toFieldErrors(result.error.issues))
            return
        }

        if (!token) {
            setRequestError("Link de redefinição inválido. Solicite um novo link por e-mail.")
            return
        }

        setIsSubmitting(true)
        setRequestError(null)

        try {
            const response = await apiFetch("/auth/resetPassword",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email: result.data.email,
                        resetCode: token,
                        newPassword: result.data.password,
                    }),
                }
            )

            if (!response.ok) {
                throw new Error("Não foi possível redefinir a senha.")
            }

            setIsPasswordReset(true)
        } catch (error) {
            console.error("Erro ao redefinir senha:", error)
            setRequestError("Não foi possível redefinir a senha. Verifique se o link é válido ou solicite um novo.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isPasswordReset) {
        return (
            <Card {...props}>
                <CardHeader className="text-center">
                    <CheckCircle2 className="mx-auto size-8 text-primary" />
                    <CardTitle className="text-xl font-bold">Senha redefinida</CardTitle>
                    <CardDescription>
                        Sua senha foi alterada com sucesso. Faça login com a nova senha.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <Field>
                            <Button type="button" onClick={() => navigate("/login")}>
                                Ir para o login
                            </Button>
                        </Field>
                    </FieldGroup>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card {...props}>
            <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">Crie uma nova senha</CardTitle>
                <CardDescription>
                    Digite uma nova senha para acessar sua conta.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(event) => {
                        event.preventDefault()
                        handleSubmit({ email, password, confirmPassword })
                    }}
                >
                    <FieldGroup>
                        <Field data-invalid={!!errors.email}>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                readOnly
                                className="bg-muted"
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && <FieldError>{errors.email}</FieldError>}
                        </Field>
                        <Field data-invalid={!!errors.password}>
                            <InputPassword
                                value={password}
                                onChange={(value) => {
                                    setPassword(value)
                                    setErrors((prev) => ({ ...prev, password: undefined }))
                                }}
                            />
                            {errors.password && <FieldError>{errors.password}</FieldError>}
                        </Field>
                        <Field data-invalid={!!errors.confirmPassword}>
                            <InputPassword
                                label="Confirmar senha"
                                placeholder="Confirme sua senha"
                                htmlFor="confirmPassword"
                                value={confirmPassword}
                                onChange={(value) => {
                                    setConfirmPassword(value)
                                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                                }}
                            />
                            {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
                        </Field>
                        {requestError && (
                            <Field data-invalid>
                                <FieldError>{requestError}</FieldError>
                            </Field>
                        )}
                        <Field>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
                            </Button>
                            <FieldDescription className="text-center">
                                <a href="/login">Voltar para o login</a>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
