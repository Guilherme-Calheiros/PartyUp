import { createElement } from "react";

import { cn } from "@/lib/utils";
import { useGroupOptions } from "@/contexts/GroupOptionsContext";
import { getGroupIcon } from "@/constants/group-Icons";

type GroupAvatarProps = {
  iconKey: string;
  colorKey: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
  alt?: string;
};

export default function GroupAvatar({
  iconKey,
  colorKey,
  imageUrl,
  size = 60,
  className,
  alt = "Imagem do grupo",
}: GroupAvatarProps) {
  const { getColor } = useGroupOptions();
  const color = getColor(colorKey);
  const dimensions = { width: size, height: size };

  if (imageUrl) {
    return (
      <div
        className={cn("shrink-0 overflow-hidden rounded-2xl bg-muted", className)}
        style={dimensions}
      >
        <img src={imageUrl} alt={alt} className="size-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        color ? "text-white" : "bg-muted text-muted-foreground",
        className,
      )}
      style={{ ...dimensions, backgroundColor: color?.value }}
    >
      {createElement(getGroupIcon(iconKey), {
        "aria-hidden": true,
        style: { width: size * 0.5, height: size * 0.5 },
      })}
    </div>
  );
}
