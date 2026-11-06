import { Gamepad2 } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";

export default function GroupGamesTab() {
  return (
    <EmptyState
      icon={Gamepad2}
      title="Nenhum jogo por aqui ainda"
      description="Os jogos do grupo aparecerão nesta seção."
    />
  );
}
