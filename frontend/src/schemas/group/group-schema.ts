import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome do grupo.")
    .max(80, "O nome do grupo deve ter no máximo 80 caracteres."),
  description: z.string().trim().max(500, "A descrição deve ter no máximo 500 caracteres."),
  iconKey: z.string().min(1, "Selecione um ícone."),
  colorKey: z.string().min(1, "Selecione uma cor."),
});

export type CreateGroupRequest = z.infer<typeof createGroupSchema>;
