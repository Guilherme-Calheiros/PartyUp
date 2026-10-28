using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PartyUp.Contracts.User;

namespace PartyUp.Endpoints;

public static class ProfileEndpoints
{
    public static WebApplication MapProfileEndpoints(this WebApplication app)
    {
        var profile = app.MapGroup("/profile").WithTags("Profile");

        profile.MapGet("me", async (
            ClaimsPrincipal user,
            PartyUpContext context) => 
        {
            var identityId = user.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (identityId is null)
            {
                return Results.Unauthorized();
            }

            var profile = await context.UsersProfile
                .FirstOrDefaultAsync(p => p.IdentityId == identityId);

            if (profile is null)
            {
                return Results.NotFound();
            }

            return Results.Ok(new
            {
                profile.UserName,
                profile.AvatarSeed,
                profile.ProfilePictureUrl
            });
        }).RequireAuthorization();

        profile.MapPatch("me", async (
            UpdateUserRequest request,
            ClaimsPrincipal user,
            PartyUpContext context) =>
        {
            var identityId = user.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (identityId is null)
            {
                return Results.Unauthorized();
            }

            var profile = await context.UsersProfile
                .FirstOrDefaultAsync(p => p.IdentityId == identityId);

            if (profile is null)
            {
                return Results.NotFound();
            }

            if (request.UserName is not null)
            {
                if (string.IsNullOrWhiteSpace(request.UserName))
                {
                    return Results.BadRequest("Username não pode ser vazio.");
                }

                profile.UserName = request.UserName.Trim();
            }

            if (request.AvatarSeed is not null)
            {
                if (string.IsNullOrWhiteSpace(request.AvatarSeed))
                {
                    return Results.BadRequest("Avatar de usuário inválido.");
                }

                profile.AvatarSeed = request.AvatarSeed.Trim();
            }

            if (request.ProfilePictureUrl.HasValue)
            {
                var picture = request.ProfilePictureUrl.Value;

                if (picture.ValueKind == JsonValueKind.Null)
                {
                    profile.ProfilePictureUrl = null;
                }
                else if (picture.ValueKind == JsonValueKind.String)
                {
                    var url = picture.GetString();

                    if (string.IsNullOrWhiteSpace(url))
                        return Results.BadRequest("URL da foto inválida.");

                    if (!Uri.TryCreate(url, UriKind.Absolute, out var parsedUrl)
                        || (parsedUrl.Scheme != Uri.UriSchemeHttps
                            && parsedUrl.Scheme != Uri.UriSchemeHttp))
                    {
                        return Results.BadRequest("URL da foto inválida.");
                    }

                    // TODO: fazer o save da url no S2 da cloudflare

                    profile.ProfilePictureUrl = url;
                }
                else
                {
                    return Results.BadRequest("URL da foto inválida.");
                }
            }

            await context.SaveChangesAsync();

            return Results.Ok(new
            {
                profile.UserName,
                profile.AvatarSeed,
                profile.ProfilePictureUrl
            });
        }).RequireAuthorization();

        return app;
    }
}