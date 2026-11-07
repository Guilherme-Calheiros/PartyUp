import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

import GroupAvatar from "@/components/GroupAvatar";
import GroupForm, { type GroupFormValues } from "@/components/group/GroupForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_GROUP_ICON_KEY } from "@/constants/group-Icons";
import { useCreateGroupMutation } from "@/hooks/useGroups";

const DEFAULT_COLOR_KEY = "indigo";

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const createGroupMutation = useCreateGroupMutation();
  const [previewIconKey, setPreviewIconKey] = useState<string>(DEFAULT_GROUP_ICON_KEY);
  const [previewColorKey, setPreviewColorKey] = useState(DEFAULT_COLOR_KEY);

  function handleSubmit(values: GroupFormValues) {
    createGroupMutation.reset();

    createGroupMutation.mutate(
      {
        name: values.name,
        description: values.description || null,
        iconKey: values.iconKey,
        colorKey: values.colorKey,
        groupPictureUrl: null,
      },
      {
        onSuccess: (group) => {
          navigate(`/grupos/${group.id}`);
        },
        onError: (error) => {
          console.error("Erro ao criar grupo:", error);
        },
      },
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="self-start" render={<Link to="/grupos" />}>
          <ArrowLeft aria-hidden="true" />
          Voltar para meus grupos
        </Button>

        <div className="flex items-center gap-4">
          <GroupAvatar
            iconKey={previewIconKey}
            colorKey={previewColorKey}
            size={56}
            alt="Prévia do grupo"
          />
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Novo grupo</h1>
        </div>
      </div>

      <Card className="py-6">
        <CardContent className="px-6">
          <GroupForm
            submitLabel="Criar grupo"
            pendingLabel="Criando..."
            isSaving={createGroupMutation.isPending}
            requestError={createGroupMutation.error?.message ?? null}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/grupos")}
            onAppearanceChange={(iconKey, colorKey) => {
              setPreviewIconKey(iconKey);
              setPreviewColorKey(colorKey);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
