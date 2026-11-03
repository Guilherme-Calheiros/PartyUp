import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import InputPassword from "./ui/inputPassword";
import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { apiFetch, throwIfApiError } from "@/lib/api";
import { useNavigate, useLocation } from "react-router";
import { loginSchema, type LoginRequest } from "@/schemas/auth/login-schema";
import { toFieldErrors } from "@/schemas/utils";
import { useAuth } from "@/contexts/AuthContext";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof LoginRequest, string>>>({});
  const { refreshUser } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/inicio";

  const handleReset = () => {
    setEmail("");
    setPassword("");
  };

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      await throwIfApiError(response, "Não foi possível fazer login.");
    },
    onSuccess: async () => {
      await refreshUser();
      handleReset();
      navigate(from, { replace: true });
    },
    onError: (error) => {
      console.error("Erro ao fazer login:", error);
    },
  });

  const handleSubmit = (loginRequest: LoginRequest) => {
    const result = loginSchema.safeParse(loginRequest);

    if (!result.success) {
      setErrors(toFieldErrors(result.error.issues));
      return;
    }

    loginMutation.mutate(result.data);
  };

  const isSubmitting = loginMutation.isPending;
  const requestError = loginMutation.error?.message ?? null;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Bem vindo de volta</CardTitle>
          <CardDescription>Faça login na sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit({ email, password });
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
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
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
                    setPassword(value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
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
  );
}
