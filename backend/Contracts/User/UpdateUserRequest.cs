using System.Text.Json;

namespace PartyUp.Contracts.User;

public class UpdateUserRequest
{
    public string? UserName { get; set; }
    public string? AvatarSeed { get; set; }
    public JsonElement? ProfilePictureUrl { get; set; }
}