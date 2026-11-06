using PartyUp.Models;

namespace PartyUp.Contracts.Group;

public record GroupResponse(
    string Id,
    string Name,
    string? Description,
    string IconKey,
    string ColorKey,
    string? GroupPictureUrl,
    DateTime CreatedAt,
    string OwnerId,
    string OwnerName,
    int MemberCount,
    GroupRole UserRole
);
