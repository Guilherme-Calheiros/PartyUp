using Microsoft.AspNetCore.Identity;

namespace PartyUp.Models;

public class UserModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string IdentityId { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? ProfilePictureUrl { get; set; }
    public string AvatarSeed { get; set; } = null!;
    public IdentityUser IdentityUser { get; set; } = null!;
    public ICollection<GroupMember> GroupMemberships { get; set; } = new List<GroupMember>();
}