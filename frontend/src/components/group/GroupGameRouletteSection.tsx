import { useMemo, useState } from "react";
import { Dices } from "lucide-react";

import GroupGameRouletteDialog from "@/components/group/GroupGameRouletteDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGroupGamesQuery } from "@/hooks/useGroupGames";

type GroupGameRouletteSectionProps = {
  groupId: string;
};

export default function GroupGameRouletteSection({ groupId }: GroupGameRouletteSectionProps) {
  const { data } = useGroupGamesQuery(groupId);
  const games = useMemo(() => data ?? [], [data]);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="gap-4 px-5 py-5 sm:px-6">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-heading text-lg font-medium">Sortear um jogo</h2>
          <p className="text-sm text-muted-foreground">
            Deixe o acaso escolher o próximo jogo do grupo.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center py-4">
          <Dices className="size-20 text-primary" aria-hidden="true" />
        </div>

        <Button size="lg" className="w-full" onClick={() => setOpen(true)} disabled={games.length === 0}>
          Abrir sorteio
        </Button>
      </Card>

      <GroupGameRouletteDialog games={games} open={open} onOpenChange={setOpen} />
    </>
  );
}
