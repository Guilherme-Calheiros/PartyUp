export const profileKeys = {
  all: ["profile"] as const,
  me: ["profile", "me"] as const,
};

export const groupKeys = {
  all: ["groups"] as const,
  options: ["groups", "options"] as const,
  list: (page: number, pageSize: number, role: string) =>
    ["groups", "list", { page, pageSize, role }] as const,
  detail: (groupId: string) => ["groups", "detail", groupId] as const,
  members: (groupId: string) => ["groups", "detail", groupId, "members"] as const,
  invite: (groupId: string) => ["groups", "detail", groupId, "invite"] as const,
  inviteByToken: (token: string) => ["invites", token] as const,
};
