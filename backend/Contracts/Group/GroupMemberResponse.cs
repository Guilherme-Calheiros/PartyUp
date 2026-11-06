using PartyUp.Models;

namespace PartyUp.Contracts.Group;

public record GroupMemberResponse(
    string UserId,
    string UserName,
    string AvatarSeed,
    string? ProfilePictureUrl,
    GroupRole Role
);
