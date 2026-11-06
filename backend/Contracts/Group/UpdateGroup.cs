using System.Text.Json;

namespace PartyUp.Contracts.Group;

public record UpdateGroupRequest(
    string? Name,
    string? Description,
    string? IconKey,
    string? ColorKey,
    JsonElement GroupPictureUrl
);

public record UpdateGroupResponse(
    string Id,
    string Name,
    string? Description,
    string IconKey,
    string ColorKey,
    string? GroupPictureUrl
);