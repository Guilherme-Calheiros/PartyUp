import { useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_GROUP_ICON_KEY, GROUP_ICONS, getGroupIcon } from "@/constants/group-Icons";
import { useGroupOptions } from "@/contexts/GroupOptionsContext";
import { cn } from "@/lib/utils";
import { createGroupSchema, type CreateGroupRequest } from "@/schemas/group/group-schema";
import { toFieldErrors } from "@/schemas/utils";

const DEFAULT_COLOR_KEY = "indigo";

const ICON_LABELS: Record<string, string> = {
  "gamepad-2": "Controle",
  swords: "Espadas",
  crown: "Coroa",
  ghost: "Fantasma",
  shield: "Escudo",
  rocket: "Foguete",
  trophy: "Troféu",
  skull: "Caveira",
};

function getIconLabel(key: string) {
  return ICON_LABELS[key] ?? key;
}

export type GroupFormValues = {
  name: string;
  description: string;
  iconKey: string;
  colorKey: string;
};

type GroupFormProps = {
  initialValues?: GroupFormValues;
  submitLabel: string;
  pendingLabel: string;
  isSaving: boolean;
  requestError: string | null;
  onSubmit: (values: GroupFormValues) => void;
  onCancel: () => void;
  onAppearanceChange?: (iconKey: string, colorKey: string) => void;
};

export default function GroupForm({
  initialValues,
  submitLabel,
  pendingLabel,
  isSaving,
  requestError,
  onSubmit,
  onCancel,
  onAppearanceChange,
}: GroupFormProps) {
  const { icons, colors } = useGroupOptions();

  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [iconKey, setIconKey] = useState<string>(initialValues?.iconKey ?? DEFAULT_GROUP_ICON_KEY);
  const [colorKey, setColorKey] = useState(initialValues?.colorKey ?? DEFAULT_COLOR_KEY);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateGroupRequest, string>>>({});

  const iconOptions = icons.length > 0 ? icons : Object.keys(GROUP_ICONS);

  function clearError(field: keyof CreateGroupRequest) {
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = createGroupSchema.safeParse({
      name,
      description,
      iconKey,
      colorKey,
    });

    if (!result.success) {
      setErrors(toFieldErrors(result.error.issues));
      return;
    }

    onSubmit({
      name: result.data.name,
      description: result.data.description,
      iconKey: result.data.iconKey,
      colorKey: result.data.colorKey,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="groupName">Nome do grupo</FieldLabel>
          <Input
            id="groupName"
            type="text"
            placeholder="Ex.: Galera do Ranking"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearError("name");
            }}
            aria-invalid={!!errors.name}
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="groupDescription">
            Descrição <span className="font-normal text-muted-foreground">(opcional)</span>
          </FieldLabel>
          <textarea
            id="groupDescription"
            rows={4}
            placeholder="Conte um pouco sobre o grupo..."
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              clearError("description");
            }}
            aria-invalid={!!errors.description}
            className="min-h-24 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
          />

          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {errors.description && <FieldError>{errors.description}</FieldError>}
            </div>
            <span
              className={cn(
                "shrink-0 text-xs",
                description.length > 500 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {description.length}/500
            </span>
          </div>
        </Field>
      </FieldGroup>

      <Separator className="my-6" />

      <FieldGroup>
        <Field data-invalid={!!errors.iconKey}>
          <FieldLabel>Ícone</FieldLabel>
          <div
            role="radiogroup"
            aria-label="Ícone do grupo"
            className="flex w-full flex-wrap gap-1.5"
          >
            {iconOptions.map((key) => {
              const Icon = getGroupIcon(key);
              const isSelected = iconKey === key;

              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={getIconLabel(key)}
                  title={getIconLabel(key)}
                  onClick={() => {
                    setIconKey(key);
                    clearError("iconKey");
                    onAppearanceChange?.(key, colorKey);
                  }}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg border transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          {errors.iconKey && <FieldError>{errors.iconKey}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.colorKey}>
          <FieldLabel>Cor</FieldLabel>
          <div
            role="radiogroup"
            aria-label="Cor do grupo"
            className="flex w-full flex-wrap items-center gap-2"
          >
            {colors.map((color) => {
              const isSelected = colorKey === color.key;

              return (
                <button
                  key={color.key}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={color.label}
                  title={color.label}
                  onClick={() => {
                    setColorKey(color.key);
                    clearError("colorKey");
                    onAppearanceChange?.(iconKey, color.key);
                  }}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    isSelected
                      ? "scale-110 border-foreground"
                      : "border-transparent hover:scale-105",
                  )}
                  style={{ backgroundColor: color.value }}
                >
                  {isSelected && <Check className="size-3.5 text-white" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          {errors.colorKey && <FieldError>{errors.colorKey}</FieldError>}
        </Field>
      </FieldGroup>

      {requestError && <p className="mt-4 text-sm text-destructive">{requestError}</p>}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
