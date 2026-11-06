using PartyUp.Models;

namespace PartyUp.Contracts.Group;

public record GroupSummaryResponse(
    string Id,
    string Name,
    string? Description,
    string IconKey,
    string ColorKey,
    string? GroupPictureUrl,
    DateTime CreatedAt,
    int MemberCount,
    GroupRole UserRole
);