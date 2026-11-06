export type GroupRole = "Owner" | "Admin" | "Member";

type GroupBase = {
  id: string;
  name: string;
  description: string | null;
  iconKey: string;
  colorKey: string;
  groupPictureUrl: string | null;
  createdAt: string;
};

export type GroupSummary = GroupBase & {
  memberCount: number;
  userRole: GroupRole;
};

export type GroupDetail = GroupBase & {
  ownerId: string;
  ownerName: string;
  memberCount: number;
  userRole: GroupRole;
};

export type GroupInvite = GroupBase & {
  ownerId: string;
  ownerUserName: string;
  membersCount: number;
};

export type JoinGroupResponse = {
  groupId: string;
};

export type GroupMember = {
  userId: string;
  userName: string;
  avatarSeed: string;
  profilePictureUrl: string | null;
  role: GroupRole;
};

export type PagedGroups = {
  items: GroupSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
