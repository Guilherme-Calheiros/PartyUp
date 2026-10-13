using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace PartyUp.Endpoints;

public static class AuthEndpoints
{
    public static WebApplication MapAuthEndpoits(this WebApplication app)
    {
        var auth = app.MapGroup("/auth").WithTags("Authentication");

        auth.MapIdentityApi<IdentityUser>();
        
        auth.MapPost("logout", async (SignInManager<IdentityUser> signInManager,
            [FromBody] object empty) =>
        {
            if (empty != null)
            {
                await signInManager.SignOutAsync();
                return Results.Ok();
            }
            else
            {
                return Results.Unauthorized();
            }
        })
        .RequireAuthorization();

        return app;
    }
}