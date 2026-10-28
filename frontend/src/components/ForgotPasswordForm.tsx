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
import { useState } from "react"
import { MailCheck } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { forgotPasswordSchema, type ForgotPasswordRequest } from "@/schemas/auth/forgot-password-schema"
import { toFieldErrors } from "@/schemas/utils"

export default function ForgotPasswordForm({ ...props }: React.ComponentProps<typeof Card>) {
    const [email, setEmail] = useState("")
    const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordRequest, string>>>({})
    const [requestError, setRequestError] = useState<string | null>(null)
    const [isEmailSent, setIsEmailSent] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (forgotPasswordRequest: ForgotPasswordRequest) => {
        const result = forgotPasswordSchema.safeParse(forgotPasswordRequest)

        if (!result.success) {
            setErrors(toFieldErrors(result.error.issues))
            return
        }

        setIsSubmitting(true)
        setRequestError(null)

        try {
            const response = await apiFetch("/auth/forgotPassword",
                {
                    method: "POST",
                    body: JSON.stringify(result.data),
                }
            )

            if (!response.ok) {
                throw new Error("Não foi possível solicitar a redefinição de senha.")
            }

            setIsEmailSent(true)
        } catch (error) {
            console.error("Erro ao solicitar redefinição de senha:", error)
            setRequestError("Não foi possível solicitar a redefinição de senha. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isEmailSent) {
        return (
            <Card {...props}>
                <CardHeader className="text-center">
                    <MailCheck className="mx-auto size-8 text-primary" />
                    <CardTitle className="text-xl font-bold">Verifique seu e-mail</CardTitle>
                    <CardDescription>
                        Se a conta existir, você receberá as instruções por e-mail.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <Field>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEmailSent(false)}
                            >
                                Enviar novamente
                            </Button>
                            <FieldDescription className="text-center">
                                <a href="/login">Voltar para o login</a>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card {...props}>
            <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">Recupere sua senha</CardTitle>
                <CardDescription>
                    Digite seu e-mail e enviaremos as instruções para redefinir sua senha.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(event) => {
                        event.preventDefault()
                        handleSubmit({ email })
                    }}
                >
                    <FieldGroup>
                        <Field data-invalid={!!errors.email}>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Digite seu email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setErrors((prev) => ({ ...prev, email: undefined }))
                                }}
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && <FieldError>{errors.email}</FieldError>}
                        </Field>
                        {requestError && (
                            <Field data-invalid>
                                <FieldError>{requestError}</FieldError>
                            </Field>
                        )}
                        <Field>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Enviando..." : "Enviar instruções"}
                            </Button>
                            <FieldDescription className="text-center">
                                Lembrou a senha? <a href="/login">Entrar</a>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
