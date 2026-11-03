import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import InputPassword from "@/components/ui/inputPassword";
import { apiFetch, throwIfApiError } from "@/lib/api";
import { changePasswordSchema, type ChangePasswordRequest } from "@/schemas/profile/profile-schema";
import { toFieldErrors } from "@/schemas/utils";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordRequest, string>>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await apiFetch("/auth/changePassword", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      await throwIfApiError(response, "Não foi possível alterar a senha.");
    },
    onSuccess: () => {
      resetForm();
      setSuccessMessage("Senha alterada com sucesso.");
    },
    onError: (error) => {
      console.error("Erro ao alterar senha:", error);
    },
  });

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      setErrors(toFieldErrors(result.error.issues));
      return;
    }

    setSuccessMessage(null);
    changePasswordMutation.mutate(result.data);
  }

  const isSubmitting = changePasswordMutation.isPending;
  const requestError = changePasswordMutation.error?.message ?? null;

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!errors.currentPassword}>
          <InputPassword
            label="Senha atual"
            placeholder="Digite sua senha atual"
            htmlFor="currentPassword"
            value={currentPassword}
            onChange={(value) => {
              setCurrentPassword(value);
              setErrors((prev) => ({ ...prev, currentPassword: undefined }));
            }}
          />
          {errors.currentPassword && <FieldError>{errors.currentPassword}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.newPassword}>
          <InputPassword
            label="Nova senha"
            placeholder="Digite sua nova senha"
            htmlFor="newPassword"
            value={newPassword}
            onChange={(value) => {
              setNewPassword(value);
              setErrors((prev) => ({ ...prev, newPassword: undefined }));
            }}
          />
          {errors.newPassword && <FieldError>{errors.newPassword}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <InputPassword
            label="Confirmar nova senha"
            placeholder="Confirme sua nova senha"
            htmlFor="confirmPassword"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
          />
          {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
        </Field>

        {requestError && (
          <Field data-invalid>
            <FieldError>{requestError}</FieldError>
          </Field>
        )}

        {successMessage && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-emerald-600/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 className="size-4 shrink-0" />
            {successMessage}
          </div>
        )}

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Alterando..." : "Alterar senha"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
