import { useEffect, useState } from "react";
import { CheckCircle2, Pencil, Shuffle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth, type User } from "@/contexts/AuthContext";
import { apiFetch, throwIfApiError } from "@/lib/api";
import { updateProfileSchema, type UpdateProfileRequest } from "@/schemas/profile/profile-schema";
import { toFieldErrors } from "@/schemas/utils";

type ProfileDetailsCardProps = {
  user: User;
};

export default function ProfileDetailsCard({ user }: ProfileDetailsCardProps) {
  const { refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(user.userName);
  const [avatarSeed, setAvatarSeed] = useState(user.avatarSeed);
  const [profilePictureUrl, setProfilePictureUrl] = useState(user.profilePictureUrl);
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateProfileRequest, string>>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hasChanges =
    userName.trim() !== user.userName ||
    avatarSeed !== user.avatarSeed ||
    profilePictureUrl !== user.profilePictureUrl;

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await apiFetch("/profile/me", {
        method: "PATCH",
        body: JSON.stringify({
          userName: data.userName,
          avatarSeed,
          profilePictureUrl,
        }),
      });

      await throwIfApiError(response, "Não foi possível salvar as alterações.");
    },
    onSuccess: async () => {
      await refreshUser({ silent: true });
      setIsEditing(false);
      setSuccessMessage("Perfil atualizado com sucesso.");
    },
    onError: (error) => {
      console.error("Erro ao atualizar perfil:", error);
    },
  });

  function resetUserData() {
    setUserName(user.userName);
    setAvatarSeed(user.avatarSeed);
    setProfilePictureUrl(user.profilePictureUrl);
  }

  function startEditing() {
    resetUserData();
    setErrors({});
    updateProfileMutation.reset();
    setSuccessMessage(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    resetUserData();
    setErrors({});
    updateProfileMutation.reset();
    setIsEditing(false);
  }

  function randomizeAvatar() {
    setAvatarSeed(crypto.randomUUID());
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = updateProfileSchema.safeParse({ userName });

    if (!result.success) {
      setErrors(toFieldErrors(result.error.issues));
      return;
    }

    if (!hasChanges) {
      return;
    }

    updateProfileMutation.mutate(result.data);
  }

  const isSaving = updateProfileMutation.isPending;
  const requestError = updateProfileMutation.error?.message ?? null;

  return (
    <Card className="py-6">
      <CardContent className="px-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <UserAvatar seed={avatarSeed} profilePictureUrl={user.profilePictureUrl} size={72} />
              <div className="flex flex-col items-start gap-2">
                <div>
                  <p className="text-sm font-medium">Foto de Perfil</p>
                  <p className="text-sm text-muted-foreground">Gere um novo avatar.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={randomizeAvatar}>
                  <Shuffle />
                  Randomizar avatar
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            <FieldGroup>
              <Field data-invalid={!!errors.userName}>
                <FieldLabel htmlFor="userName">Nome de usuário</FieldLabel>
                <Input
                  id="userName"
                  type="text"
                  placeholder="Digite seu nome de usuário"
                  value={userName}
                  onChange={(event) => {
                    setUserName(event.target.value);
                    setErrors((prev) => ({ ...prev, userName: undefined }));
                  }}
                  aria-invalid={!!errors.userName}
                />
                {errors.userName && <FieldError>{errors.userName}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" value={user.email} disabled />
                <FieldDescription>O email da conta não pode ser alterado.</FieldDescription>
              </Field>
            </FieldGroup>

            {requestError && <p className="mt-4 text-sm text-destructive">{requestError}</p>}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={cancelEditing} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !hasChanges}>
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <UserAvatar
                seed={user.avatarSeed}
                profilePictureUrl={user.profilePictureUrl}
                size={64}
              />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{user.userName}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={startEditing}>
              <Pencil />
              Editar perfil
            </Button>
          </div>
        )}

        {successMessage && !isEditing && (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-600/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 className="size-4 shrink-0" />
            {successMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
