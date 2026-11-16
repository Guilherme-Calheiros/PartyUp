using System.Text.Json.Serialization;

namespace PartyUp.Contracts.Games;

public class IgdbGames
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public IgdbCover? Cover { get; set; }

    public List<IgdbPlatform>? Platforms { get; set; }

    [JsonPropertyName("total_rating_count")]
    public int TotalRatingCount { get; set; }

    public string? CoverUrl => Cover?.ImageId is string imageId
        ? $"https://images.igdb.com/igdb/image/upload/t_cover_big/{imageId}.jpg"
        : null;
}

public class IgdbCover
{
    [JsonPropertyName("image_id")]
    public string? ImageId { get; set; }
}

public class IgdbPlatform
{
    public string Name { get; set; } = null!;
}
