using System.Text.Json;
using System.Net.Http.Json;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json.Serialization;
using PartyUp.Contracts.Games;

namespace PartyUp.Services;

public class IgdbService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly IMemoryCache _cache;

    public IgdbService(
        HttpClient httpClient,
        IConfiguration configuration,
        IMemoryCache cache
    )
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _cache = cache;
    }

    private async Task<string> GetAccessTokenAsync()
    {
        var cachedToken = _cache.Get<string>("IGDB_ACCESS_TOKEN");

        if (cachedToken is not null)
        {
            return cachedToken;
        }

        var clientId = _configuration["IGDB:ClientId"];
        var clientSecret = _configuration["IGDB:ClientSecret"];

        var parameters = new Dictionary<string, string>
        {
            { "client_id", clientId! },
            { "client_secret", clientSecret! },
            { "grant_type", "client_credentials" }
        };

        using var response = await _httpClient.PostAsync("https://id.twitch.tv/oauth2/token", new FormUrlEncodedContent(parameters));

        response.EnsureSuccessStatusCode();

        var token = await response.Content.ReadFromJsonAsync<TokenResponse>();

        if (token is null)
        {
            throw new Exception("Erro ao recuperar token de acesso do IGDB.");
        }

        _cache.Set(
            "IGDB_ACCESS_TOKEN",
            token.AccessToken,
            TimeSpan.FromSeconds(token.ExpiresIn - 60)
        );

        return token.AccessToken;
    }

    public async Task<List<IgdbGames>> SearchGamesAsync(
        string query,
        int page = 1,
        int pageSize = 20)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var offset = (page - 1) * pageSize;
        var accessToken = await GetAccessTokenAsync();

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.igdb.com/v4/games");
        request.Headers.Add("Client-ID", _configuration["IGDB:ClientId"]);
        request.Headers.Add("Authorization", $"Bearer {accessToken}");
        var safeQuery = query.Trim().Replace("\\", "\\\\").Replace("\"", "\\\"");
        var body = $$"""
            fields id, name, cover.image_id, platforms.name, total_rating, total_rating_count;
            where name ~ *"{{safeQuery}}"*;
            sort total_rating_count desc;
            limit 500;
        """;

        request.Content = new StringContent(
            body,
            System.Text.Encoding.UTF8,
            "text/plain"
        );

        using var response = await _httpClient.SendAsync(request);

        response.EnsureSuccessStatusCode();

        var games = await response.Content.ReadFromJsonAsync<List<IgdbGames>>() ?? [];

        return games
            .OrderByDescending(g =>
                string.Equals(
                    g.Name,
                    query.Trim(),
                    StringComparison.OrdinalIgnoreCase
                ))
            .ThenByDescending(g => g.TotalRatingCount)
            .Skip(offset)
            .Take(pageSize)
            .ToList();
    }


    public async Task<List<IgdbGames>> GetTrendingGamesAsync(
        int page = 1,
        int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var trendingGames = await _cache.GetOrCreateAsync(
            "IGDB_TRENDING_GAMES",
            async entry =>
            {
                entry.AbsoluteExpiration = DateTimeOffset.Now.Date.AddDays(1);

                return await FetchTrendingGamesAsync();
            }
        ) ?? [];

        var offset = (page - 1) * pageSize;

        return trendingGames
            .Skip(offset)
            .Take(pageSize)
            .ToList();
    }

    private async Task<List<IgdbGames>> FetchTrendingGamesAsync()
    {
        var accessToken = await GetAccessTokenAsync();

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "https://api.igdb.com/v4/popularity_primitives"
        );

        request.Headers.Add("Client-ID", _configuration["IGDB:ClientId"]);
        request.Headers.Add("Authorization", $"Bearer {accessToken}");

        var query = $$"""
            fields game_id,popularity_type,value;
            where popularity_type = (1, 2, 3);
            sort value desc;
            limit 500;
        """;

        request.Content = new StringContent(
            query,
            System.Text.Encoding.UTF8,
            "text/plain"
        );

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();

        using var document = JsonDocument.Parse(json);

        var ids = document.RootElement
            .EnumerateArray()
            .GroupBy(item => item.GetProperty("game_id").GetInt32())
            .Select(group => new
            {
                GameId = group.Key,

                firstParam = group
                    .Where(item => item.GetProperty("popularity_type").GetInt32() == 1)
                    .Sum(item => item.GetProperty("value").GetDouble()),

                secondParam = group
                    .Where(item => item.GetProperty("popularity_type").GetInt32() == 2)
                    .Sum(item => item.GetProperty("value").GetDouble()),

                thirdParam = group
                    .Where(item => item.GetProperty("popularity_type").GetInt32() == 3)
                    .Sum(item => item.GetProperty("value").GetDouble()),
            })
            .Select(game => new
            {
                game.GameId,
                WeightedScore = game.firstParam * 0.5 + game.secondParam * 0.3 + game.thirdParam * 0.3
            })
            .OrderByDescending(game => game.WeightedScore)
            .Take(100)
            .Select(game => game.GameId)
            .ToList();

        if (ids.Count == 0)
            return [];

        using var gamesRequest = new HttpRequestMessage(
            HttpMethod.Post,
            "https://api.igdb.com/v4/games"
        );

        gamesRequest.Headers.Add("Client-ID", _configuration["IGDB:ClientId"]);
        gamesRequest.Headers.Add("Authorization", $"Bearer {accessToken}");

        var gamesQuery = $$"""
            fields id,name,cover.image_id,rating;
            where id = ({{string.Join(",", ids)}})
                & (themes != (42) | themes = null)
                & version_parent = null;
            limit {{ids.Count}};
            """;

        gamesRequest.Content = new StringContent(
            gamesQuery,
            System.Text.Encoding.UTF8,
            "text/plain"
        );

        using var gamesResponse = await _httpClient.SendAsync(gamesRequest);
        gamesResponse.EnsureSuccessStatusCode();

        var games = await gamesResponse.Content.ReadFromJsonAsync<List<IgdbGames>>();

        if (games == null)
            return [];

        var gamesById = games.ToDictionary(game => game.Id);

        return ids
            .Where(id => gamesById.ContainsKey(id))
            .Select(id => gamesById[id])
            .ToList();
    }

    private class TokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = null!;

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }
}