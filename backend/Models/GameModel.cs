using System.Text.Json.Serialization;

namespace PartyUp.Models;

public class GameModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public int IgdbId { get; set; }
    public string Name { get; set; } = null!;
    public string? CoverImageId { get; set; }
    public ICollection<GroupGameModel> GroupGames { get; set; } = new List<GroupGameModel>();
}