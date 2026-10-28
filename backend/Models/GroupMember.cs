namespace PartyUp.Models;

public class GroupMember
{
    public string UserId { get; set; } = null!;
    public UserModel User { get; set; } = null!;
    public string GroupId { get; set; } = null!;
    public GroupModel Group { get; set; } = null!;
    public GroupRole Role { get; set; } = GroupRole.Member;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}

public enum GroupRole
{
    Owner,
    Admin,
    Member
}