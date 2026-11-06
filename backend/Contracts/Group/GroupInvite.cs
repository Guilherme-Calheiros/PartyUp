namespace PartyUp.Contracts.Group;

public record GroupInviteResponse(
    string Id,
    string Name,
    string? Description,
    string IconKey,
    string ColorKey,
    string? GroupPictureUrl,
    DateTime CreatedAt,
    string OwnerId,
    string OwnerUserName,
    int MembersCount
);