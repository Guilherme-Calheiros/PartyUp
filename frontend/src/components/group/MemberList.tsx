import type { ReactNode } from "react";

import GroupMemberRow from "@/components/group/GroupMemberRow";
import { cn } from "@/lib/utils";
import type { GroupMember } from "@/types/group";

type MemberListProps = {
  members: GroupMember[];
  renderActions?: (member: GroupMember) => ReactNode;
  className?: string;
};

export default function MemberList({ members, renderActions, className }: MemberListProps) {
  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {members.map((member) => (
        <GroupMemberRow key={member.userId} member={member} actions={renderActions?.(member)} />
      ))}
    </ul>
  );
}
