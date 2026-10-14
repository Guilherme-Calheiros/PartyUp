using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PartyUp.Contracts.Auth;

namespace PartyUp.Endpoints;
public static class AuthEndpoints
{
    public static WebApplication MapAuthEndpoits(this WebApplication app)
    {
        var auth = app.MapGroup("/auth").WithTags("Authentication");

        auth.MapIdentityApi<IdentityUser>();

        auth.MapPost("changePassword", async (ClaimsPrincipal principal, UserManager<IdentityUser> userManager,
            [FromBody] ChangePasswordRequest request) =>
        {
            var user = await userManager.GetUserAsync(principal);
            if (user is null)
            {
                return Results.NotFound();
            }

            if (string.IsNullOrWhiteSpace(request.CurrentPassword) ||
                string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return Results.BadRequest("As senhas não podem estar vazias");
            }

            if (request.CurrentPassword == request.NewPassword)
            {
                return Results.BadRequest("A nova senha não pode ser igual à senha atual");
            }

            var result = await userManager.ChangePasswordAsync(
                user, 
                request.CurrentPassword, 
                request.NewPassword);

            if (!result.Succeeded)
            {
                return Results.BadRequest(result.Errors);
            }

            return Results.Ok(new { message = "Senha alterada com sucesso" });
        })
        .RequireAuthorization();

        auth.MapDelete("deleteAccount", async (ClaimsPrincipal principal, UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager) =>
        {
            var user = await userManager.GetUserAsync(principal);
            if (user is null)
            {
                return Results.NotFound();
            }

            var result = await userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return Results.BadRequest(result.Errors);
            }

            await signInManager.SignOutAsync();
            return Results.Ok(new { message = "Conta excluída com sucesso" });
        })
        .RequireAuthorization();

        auth.MapPost("/logout", async (SignInManager<IdentityUser> signInManager) =>
        {
            await signInManager.SignOutAsync();
            return Results.Ok(new { message = "Logout realizado com sucesso" });
        })
        .RequireAuthorization();

        return app;
    }
}