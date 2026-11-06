using System.Security.Claims;
using System.Text.Json;
using PartyUp.Contracts.User;

namespace PartyUp.Endpoints;

public static class ProfileEndpoints
{
    public static WebApplication MapProfileEndpoints(this WebApplication app)
    {
        var profileGroup = app.MapGroup("/profile").WithTags("Profile");

        profileGroup.MapGet("me", async (
            ClaimsPrincipal user,
            PartyUpContext context) =>
        {
            var (profile, isAuthenticated) = await user.GetProfileAsync(context);

            if (!isAuthenticated)
            {
                return Results.Unauthorized();
            }

            if (profile is null)
            {
                return Results.NotFound();
            }

            return Results.Ok(new
            {
                profile.Id,
                profile.UserName,
                profile.Email,
                profile.AvatarSeed,
                profile.ProfilePictureUrl
            });
        }).RequireAuthorization();

        profileGroup.MapPatch("me", async (
            UpdateUserRequest request,
            ClaimsPrincipal user,
            PartyUpContext context) =>
        {
            var (profile, isAuthenticated) = await user.GetProfileAsync(context);

            if (!isAuthenticated)
            {
                return Results.Unauthorized();
            }

            if (profile is null)
            {
                return Results.NotFound();
            }

            var errors = new Dictionary<string, string[]>();

            if (request.UserName is not null)
            {
                if (string.IsNullOrWhiteSpace(request.UserName))
                {
                    errors["UserName"] = ["Username não pode ser vazio."];
                }
                else
                {
                    profile.UserName = request.UserName.Trim();
                }
            }

            if (request.AvatarSeed is not null)
            {
                if (string.IsNullOrWhiteSpace(request.AvatarSeed))
                {
                    errors["AvatarSeed"] = ["Avatar de usuário inválido."];
                }
                else
                {
                    profile.AvatarSeed = request.AvatarSeed.Trim();
                }
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

                    if (!UrlValidation.TryNormalizeHttpUrl(
                        url,
                        out var normalizedUrl
                    ))
                    {
                        errors["ProfilePictureUrl"] = ["URL da foto inválida."];
                    }
                    else
                    {
                        // TODO: fazer o save da url no S2 da cloudflare

                        profile.ProfilePictureUrl = normalizedUrl;
                    }
                }
                else
                {
                    errors["ProfilePictureUrl"] = ["URL da foto inválida."];
                }
            }

            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            await context.SaveChangesAsync();

            return Results.Ok(new
            {
                profile.Id,
                profile.UserName,
                profile.Email,
                profile.AvatarSeed,
                profile.ProfilePictureUrl
            });
        }).RequireAuthorization();

        return app;
    }
}
