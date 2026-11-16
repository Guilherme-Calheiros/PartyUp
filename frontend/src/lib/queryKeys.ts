export const profileKeys = {
  all: ["profile"] as const,
  me: ["profile", "me"] as const,
};

export const gameKeys = {
  all: ["games"] as const,
  trending: () => ["games", "trending"] as const,
  search: (query: string, pageSize: number) => ["games", "search", { query, pageSize }] as const,
};

export const groupKeys = {
  all: ["groups"] as const,
  options: ["groups", "options"] as const,
  list: (page: number, pageSize: number, role: string) =>
    ["groups", "list", { page, pageSize, role }] as const,
  detail: (groupId: string) => ["groups", "detail", groupId] as const,
  members: (groupId: string) => ["groups", "detail", groupId, "members"] as const,
  games: (groupId: string) => ["groups", "detail", groupId, "games"] as const,
  invite: (groupId: string) => ["groups", "detail", groupId, "invite"] as const,
  inviteByToken: (token: string) => ["invites", token] as const,
};
