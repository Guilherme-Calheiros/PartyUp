import {
  Crown,
  Gamepad2,
  Ghost,
  Rocket,
  Shield,
  Skull,
  Swords,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export const GROUP_ICONS = {
  "gamepad-2": Gamepad2,
  swords: Swords,
  crown: Crown,
  ghost: Ghost,
  shield: Shield,
  rocket: Rocket,
  trophy: Trophy,
  skull: Skull,
} satisfies Record<string, LucideIcon>;

export type GroupIconKey = keyof typeof GROUP_ICONS;

export const DEFAULT_GROUP_ICON_KEY: GroupIconKey = "gamepad-2";

export function getGroupIcon(key: string): LucideIcon {
  return GROUP_ICONS[key as GroupIconKey] ?? GROUP_ICONS[DEFAULT_GROUP_ICON_KEY];
}
