using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using PartyUp.Services;

namespace PartyUp.Endpoints;

public static class GamesEndpoints
{
    public static void MapGamesEndpoints(this WebApplication app)
    {
        var games = app.MapGroup("/games").WithTags("Games").RequireAuthorization();

        games.MapGet("/search", async (
            string query,
            int? page,
            int? pageSize,
            IgdbService igdbService) =>
        {
            if (string.IsNullOrWhiteSpace(query))
                return Results.BadRequest("Informe o nome do jogo.");

            var result = await igdbService.SearchGamesAsync(
                query,
                page ?? 1,
                pageSize ?? 20
            );

            return Results.Ok(result);
        });

        games.MapGet("/trending", async (
            int? page,
            int? pageSize,
            IgdbService igdbService) =>
        {
            var result = await igdbService.GetTrendingGamesAsync(
                page ?? 1,
                pageSize ?? 20
            );

            return Results.Ok(result);
        });
    }
}