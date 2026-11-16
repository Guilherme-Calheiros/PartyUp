import type { ReactNode } from "react";

import GameCover from "@/components/game/GameCover";
import { cn } from "@/lib/utils";

type GamePosterSize = "xs" | "sm" | "fill" | "thumb";
type GamePosterCaption = "none" | "sm" | "xs";

const SIZE_STYLES: Record<GamePosterSize, { wrapper: string; frame: string }> = {
  xs: { wrapper: "w-16 shrink-0", frame: "aspect-[3/4] w-full" },
  sm: { wrapper: "w-24 shrink-0 sm:w-28", frame: "aspect-[3/4] w-full" },
  fill: { wrapper: "w-full", frame: "aspect-[3/4] w-full" },
  thumb: { wrapper: "h-16 w-12 shrink-0", frame: "h-full w-full" },
};

const CAPTION_STYLES: Record<Exclude<GamePosterCaption, "none">, string> = {
  sm: "mt-2 text-sm font-medium",
  xs: "mt-1 text-[0.7rem] leading-tight text-muted-foreground",
};

type GamePosterProps = {
  game: { name: string; coverUrl: string | null };
  size?: GamePosterSize;
  rounded?: "md" | "lg";
  caption?: GamePosterCaption;
  className?: string;
  children?: ReactNode;
};

export default function GamePoster({
  game,
  size = "sm",
  rounded = "lg",
  caption = "sm",
  className,
  children,
}: GamePosterProps) {
  const styles = SIZE_STYLES[size];

  return (
    <div className={cn(styles.wrapper, className)}>
      <div
        className={cn(
          "relative overflow-hidden bg-muted ring-1 ring-foreground/10",
          styles.frame,
          rounded === "md" ? "rounded-md" : "rounded-lg",
        )}
      >
        <GameCover coverUrl={game.coverUrl} name={game.name} className="size-full" />
        {children}
      </div>

      {caption !== "none" && (
        <p className={cn("line-clamp-2", CAPTION_STYLES[caption])} title={game.name}>
          {game.name}
        </p>
      )}
    </div>
  );
}
