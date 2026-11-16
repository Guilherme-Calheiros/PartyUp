namespace PartyUp.Models;

public class GroupGameModel
{
    public string GroupId { get; set; } = null!;
    public GroupModel Group { get; set; } = null!;
    public string GameId { get; set; } = null!;
    public GameModel Game { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}