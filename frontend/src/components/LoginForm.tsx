import { cn } from "cn"

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
import { useNavigate, useLocation } from "react-router"
import { loginSchema, type LoginRequest } from "@/schemas/auth/login-schema"
import { toFieldErrors } from "@/schemas/utils"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState<Partial<Record<keyof LoginRequest, string>>>({});
    const [requestError, setRequestError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { refreshUser} = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/inicio";

    const handleReset = () => {
        setEmail("")
        setPassword("")
    }

    const handleSubmit = async (loginRequest: LoginRequest) => {
        const result = loginSchema.safeParse(loginRequest)

        if (!result.success) {
            setErrors(toFieldErrors(result.error.issues))
            return
        }

        setRequestError(null)
        setIsSubmitting(true)

        try {
            const response = await apiFetch("/auth/login",
                {
                    method: "POST",
                    body: JSON.stringify(result.data),
                }
            );

            if (!response.ok) {
                throw new Error(
                    await getApiErrorMessage(response, "Não foi possível fazer login.")
                )
            }

            await refreshUser()
            handleReset()
            navigate(from, { replace: true });
        } catch (error) {
            console.error("Erro ao fazer login:", error)
            setRequestError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível fazer login."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold">Bem vindo de volta</CardTitle>
                    <CardDescription>
                        Faça login na sua conta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            handleSubmit({ email, password })
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
                            <Field data-invalid={!!errors.password}>
                                <InputPassword 
                                    value={password}
                                    forgotPasswordLink="/reset-password"
                                    onChange={(value) => {
                                        setPassword(value)
                                        setErrors((prev) => ({ ...prev, password: undefined }))
                                    }}
                                />
                                {errors.password && <FieldError>{errors.password}</FieldError>}
                            </Field>
                            {requestError && (
                                <Field data-invalid>
                                    <FieldError>{requestError}</FieldError>
                                </Field>
                            )}
                            <Field>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Entrando..." : "Entrar"}
                                </Button>
                                <FieldDescription className="text-center">
                                    Não tem conta? <a href="/register">Cadastrar-se</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
