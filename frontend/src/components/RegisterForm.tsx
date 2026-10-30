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
import { apiFetch, getApiErrorMessage } from "@/lib/api"
import { useNavigate } from "react-router"
import { registerSchema, type RegisterRequest } from "@/schemas/auth/register-schema"
import { toFieldErrors } from "@/schemas/utils"

export default function RegisterForm({ ...props }: React.ComponentProps<typeof Card>) {
    const [username, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterRequest, string>>>({})
    const [requestError, setRequestError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const navigate = useNavigate()

    const handleReset = () => {
        setUserName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
    }

    const handleSubmit = async (registerRequest: RegisterRequest) => {
        const result = registerSchema.safeParse(registerRequest)

        if (!result.success) {
            setErrors(toFieldErrors(result.error.issues))
            return
        }

        setRequestError(null)
        setIsSubmitting(true)

        try {
            const response = await apiFetch("/auth/register",
                {
                    method: "POST",
                    body: JSON.stringify(result.data),
                }
            )
            
            if (!response.ok) {
                throw new Error(
                    await getApiErrorMessage(response, "Não foi possível criar uma conta.")
                )
            }

            handleReset()
            navigate("/login")
        } catch (error) {
            console.error("Erro ao criar conta:", error)
            setRequestError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível criar uma conta."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card {...props}>
            <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">Crie sua conta</CardTitle>
                <CardDescription>
                    Preencha suas informações para criar uma conta.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(event) => {
                        event.preventDefault()
                        handleSubmit({username, email, password, confirmPassword})
                    }}
                >
                        <FieldGroup>
                            <Field data-invalid={!!errors.username}>
                                <FieldLabel htmlFor="name">Nome de usuário</FieldLabel>
                                <Input 
                                    id="name"
                                    type="text"
                                    placeholder="Digite seu nome de usuário"
                                    value={username}
                                    onChange={(e) => {
                                        setUserName(e.target.value)
                                        setErrors((prev) => ({ ...prev, username: undefined }))
                                    }}
                                    aria-invalid={!!errors.username}
                                />
                                {errors.username && <FieldError>{errors.username}</FieldError>}
                            </Field>
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
                        <FieldGroup>
                            <Field>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Criando conta..." : "Criar conta"}
                                </Button>
                                <FieldDescription className="px-6 text-center">
                                    Possui uma conta? <a href="/login">Entrar</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
