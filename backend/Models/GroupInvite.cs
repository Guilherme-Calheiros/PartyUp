namespace PartyUp.Models;

public class GroupInvite
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string GroupId { get; set; } = null!;
    public GroupModel Group { get; set; } = null!;
    public string Token { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}