import { Gamepad2 } from "lucide-react";

import { cn } from "@/lib/utils";

type GameCoverProps = {
  coverUrl: string | null;
  name: string;
  className?: string;
};

export default function GameCover({ coverUrl, name, className }: GameCoverProps) {
  if (!coverUrl) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}
      >
        <Gamepad2 className="size-6" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={`Capa de ${name}`}
      loading="lazy"
      className={cn("object-cover", className)}
    />
  );
}
