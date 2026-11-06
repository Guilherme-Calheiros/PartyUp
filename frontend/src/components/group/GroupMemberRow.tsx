import type { ReactNode } from "react";
import { Crown, ShieldCheck, type LucideIcon } from "lucide-react";

import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import type { GroupMember } from "@/types/group";

type RoleIndicator = {
  icon: LucideIcon;
  label: string;
  className: string;
};

const ROLE_INDICATORS: Partial<Record<GroupMember["role"], RoleIndicator>> = {
  Owner: {
    icon: Crown,
    label: "Proprietário",
    className: "text-amber-500",
  },
  Admin: {
    icon: ShieldCheck,
    label: "Administrador",
    className: "text-sky-500",
  },
};

type GroupMemberRowProps = {
  member: GroupMember;
  avatarSize?: number;
  className?: string;
  actions?: ReactNode;
};

export default function GroupMemberRow({
  member,
  avatarSize = 36,
  className,
  actions,
}: GroupMemberRowProps) {
  const indicator = ROLE_INDICATORS[member.role];
  const Icon = indicator?.icon;

  return (
    <li className={cn("flex items-center gap-3 py-1.5", className)}>
      <UserAvatar
        seed={member.avatarSeed}
        profilePictureUrl={member.profilePictureUrl}
        size={avatarSize}
        alt=""
      />

      <p className="min-w-0 flex-1 truncate text-sm font-medium">{member.userName}</p>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {indicator && Icon && (
          <span
            role="img"
            aria-label={indicator.label}
            title={indicator.label}
            className={cn("inline-flex items-center justify-center", indicator.className)}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}

        {actions}
      </div>
    </li>
  );
}
