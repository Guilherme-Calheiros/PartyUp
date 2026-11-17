import { useMemo, useRef, useState } from "react";
import { Check, Gamepad2, Search, SlidersHorizontal } from "lucide-react";

import GameCover from "@/components/game/GameCover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { GroupGame } from "@/types/group";

const SEGMENT_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#a855f7",
];

const WHEEL_RADIUS = 48;

function polar(radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: 50 + radius * Math.sin(rad),
    y: 50 - radius * Math.cos(rad),
  };
}

function segmentPath(startAngle: number, endAngle: number) {
  const start = polar(WHEEL_RADIUS, startAngle);
  const end = polar(WHEEL_RADIUS, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    "M 50 50",
    `L ${start.x} ${start.y}`,
    `A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function SelectionMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
      )}
      aria-hidden="true"
    >
      {checked && <Check className="size-3" />}
    </span>
  );
}

type RouletteWheelProps = {
  games: GroupGame[];
  rotation: number;
  spinning: boolean;
  onSpinEnd: () => void;
};

function RouletteWheel({ games, rotation, spinning, onSpinEnd }: RouletteWheelProps) {
  const count = games.length;

  if (count === 0) {
    return (
      <div className="flex aspect-square w-[280px] items-center justify-center rounded-full border-2 border-dashed border-border px-6 text-center text-sm text-muted-foreground sm:w-[320px] lg:w-[360px]">
        Selecione ao menos um jogo para montar a roleta.
      </div>
    );
  }

  const step = 360 / count;
  const thumbnailRatio = Math.min(0.16, 1.6 / count);

  return (
    <div className="relative mx-auto [--wheel-size:280px] sm:[--wheel-size:320px] lg:[--wheel-size:360px]">
      <div
        className="relative overflow-hidden rounded-full ring-4 ring-border"
        style={{ width: "var(--wheel-size)", height: "var(--wheel-size)" }}
      >
        <div
          className="h-full w-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 1)" : undefined,
          }}
          onTransitionEnd={(event) => {
            if (event.propertyName === "transform") onSpinEnd();
          }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {count === 1 ? (
              <circle cx="50" cy="50" r={WHEEL_RADIUS} fill={SEGMENT_COLORS[0]} />
            ) : (
              games.map((game, index) => (
                <path
                  key={game.id}
                  d={segmentPath(index * step, (index + 1) * step)}
                  fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                />
              ))
            )}
          </svg>

          <div className="absolute inset-0">
            {games.map((game, index) => {
              const mid = index * step + step / 2;
              return (
                <div
                  key={game.id}
                  className="absolute top-1/2 left-1/2 overflow-hidden rounded-md border border-white/70 bg-muted shadow-sm"
                  style={{
                    width: `calc(var(--wheel-size) * ${thumbnailRatio})`,
                    aspectRatio: "3 / 4",
                    transform: `translate(-50%, -50%) rotate(${mid}deg) translateY(calc(var(--wheel-size) * -0.3))`,
                  }}
                >
                  {game.coverUrl ? (
                    <img
                      src={game.coverUrl}
                      alt={`Capa de ${game.name}`}
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Gamepad2 className="size-4" aria-hidden="true" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-primary drop-shadow-sm">
        <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden="true">
          <path d="M12 23 2 1h20z" />
        </svg>
      </div>

      <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border"></div>
    </div>
  );
}

type GameOptionsPanelProps = {
  games: GroupGame[];
  selectedIds: string[];
  search: string;
  spinning: boolean;
  onSearchChange: (value: string) => void;
  onToggleAll: () => void;
  onToggleGame: (id: string) => void;
};

function GameOptionsPanel({
  games,
  selectedIds,
  search,
  spinning,
  onSearchChange,
  onToggleAll,
  onToggleGame,
}: GameOptionsPanelProps) {
  const allSelected = games.length > 0 && games.every((game) => selectedIds.includes(game.id));
  const filteredGames = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return games;
    return games.filter((game) => game.name.toLowerCase().includes(term));
  }, [games, search]);

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Jogos na roleta</p>
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} de {games.length} selecionado(s)
        </p>
      </div>

      <button
        type="button"
        aria-pressed={allSelected}
        disabled={spinning}
        onClick={onToggleAll}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          allSelected
            ? "border-primary bg-primary/10"
            : "border-border bg-muted/40 hover:bg-muted/60",
        )}
      >
        <SelectionMark checked={allSelected} />
        <span className="flex-1 text-sm font-medium">Todos os jogos</span>
        <span className="text-xs text-muted-foreground">{games.length}</span>
      </button>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar jogo..."
          aria-label="Buscar jogo do grupo"
          className="pl-8"
        />
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto rounded-lg border border-border">
        {filteredGames.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nenhum jogo encontrado.
          </li>
        ) : (
          filteredGames.map((game) => {
            const checked = selectedIds.includes(game.id);
            return (
              <li key={game.id}>
                <button
                  type="button"
                  aria-pressed={checked}
                  disabled={spinning}
                  onClick={() => onToggleGame(game.id)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <SelectionMark checked={checked} />
                  <GameCover
                    coverUrl={game.coverUrl}
                    name={game.name}
                    className="h-10 w-8 shrink-0 overflow-hidden rounded-sm"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{game.name}</span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

type RouletteDialogBodyProps = {
  games: GroupGame[];
  onClose: () => void;
};

function RouletteDialogBody({ games, onClose }: RouletteDialogBodyProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => games.map((game) => game.id));
  const [search, setSearch] = useState("");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<GroupGame | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pendingWinnerRef = useRef<GroupGame | null>(null);
  const availableIds = useMemo(() => new Set(games.map((game) => game.id)), [games]);
  const validSelectedIds = useMemo(
    () => selectedIds.filter((id) => availableIds.has(id)),
    [selectedIds, availableIds],
  );

  const selectedGames = useMemo(
    () => games.filter((game) => validSelectedIds.includes(game.id)),
    [games, validSelectedIds],
  );

  const allSelected = games.length > 0 && games.every((game) => validSelectedIds.includes(game.id));

  function resetRound() {
    setRotation(0);
    setWinner(null);
    pendingWinnerRef.current = null;
  }

  function toggleAll() {
    if (spinning) return;
    resetRound();
    setSelectedIds(allSelected ? [] : games.map((game) => game.id));
  }

  function toggleGame(gameId: string) {
    if (spinning) return;
    resetRound();
    setSelectedIds(
      validSelectedIds.includes(gameId)
        ? validSelectedIds.filter((id) => id !== gameId)
        : [...validSelectedIds, gameId],
    );
  }

  function handleSpin() {
    if (spinning || selectedGames.length === 0) return;

    const step = 360 / selectedGames.length;
    const winnerIndex = Math.floor(Math.random() * selectedGames.length);
    const segmentCenter = winnerIndex * step + step / 2;
    const jitter = (Math.random() - 0.5) * step * 0.5;
    const landing = segmentCenter + jitter;
    const targetMod = (((360 - landing) % 360) + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = ((targetMod - currentMod + 360) % 360) + 360 * 6;

    pendingWinnerRef.current = selectedGames[winnerIndex];
    setWinner(null);
    setSpinning(true);
    setRotation((current) => current + delta);
  }

  function handleSpinEnd() {
    if (!spinning) return;
    setSpinning(false);
    setWinner(pendingWinnerRef.current);
  }

  if (winner && !spinning) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Jogo sorteado</DialogTitle>
          <DialogDescription>O grupo já tem um escolhido para a próxima partida.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <GameCover
            coverUrl={winner.coverUrl}
            name={winner.name}
            className="aspect-[3/4] w-36 overflow-hidden rounded-xl shadow-md sm:w-44"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">O jogo escolhido foi...</p>
              <p className="font-heading text-xl font-semibold">{winner.name}</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button onClick={resetRound}>Voltar a roleta</Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const optionsPanel = (
    <GameOptionsPanel
      games={games}
      selectedIds={validSelectedIds}
      search={search}
      spinning={spinning}
      onSearchChange={setSearch}
      onToggleAll={toggleAll}
      onToggleGame={toggleGame}
    />
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>Sortear um jogo</DialogTitle>
        <DialogDescription>
          Escolha os jogos que entram na roleta e gire para descobrir o escolhido.
        </DialogDescription>
      </DialogHeader>

      <div className="grid min-h-0 flex-1 items-center justify-center gap-6 py-2 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col items-center justify-center gap-4 justify-self-center">
          <RouletteWheel
            games={selectedGames}
            rotation={rotation}
            spinning={spinning}
            onSpinEnd={handleSpinEnd}
          />

          <Button size="lg" onClick={handleSpin} disabled={spinning || selectedGames.length === 0}>
            {spinning ? "Girando..." : "Girar roleta"}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="md:hidden"
            onClick={() => setPickerOpen(true)}
            disabled={spinning}
          >
            <SlidersHorizontal className="size-4" data-icon="inline-start" />
            Escolher jogos
          </Button>
        </div>

        <div className="hidden min-h-0 w-full max-w-[320px] justify-self-center md:flex md:h-[420px] md:flex-col lg:max-w-[360px]">
          {optionsPanel}
        </div>
      </div>

      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="bottom" className="flex h-[85svh]! flex-col overflow-hidden">
          <SheetHeader>
            <SheetTitle>Escolher jogos</SheetTitle>
            <SheetDescription>Selecione quais jogos entram na roleta.</SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col px-4">{optionsPanel}</div>
          <SheetFooter className="border-t">
            <SheetClose render={<Button className="w-full" />}>Concluir</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

type GroupGameRouletteDialogProps = {
  games: GroupGame[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function GroupGameRouletteDialog({
  games,
  open,
  onOpenChange,
}: GroupGameRouletteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col overflow-y-auto sm:max-w-5xl">
        <RouletteDialogBody
          key={open ? "open" : "closed"}
          games={games}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
