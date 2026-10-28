namespace PartyUp.Models;

public class GroupModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OwnerId { get; set; } = null!;
    public UserModel Owner { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? GroupPictureUrl { get; set; }
    public GroupVisibility Visibility { get; set; } = GroupVisibility.Private;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Description { get; set; }
    public ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();

}
public enum GroupVisibility
{
    Public,
    Private
}