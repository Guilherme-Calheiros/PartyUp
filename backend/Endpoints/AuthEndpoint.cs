using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using PartyUp.Contracts.Auth;
using PartyUp.Models;

namespace PartyUp.Endpoints;

public static class AuthEndpoints
{
    private static readonly EmailAddressAttribute _emailAddressAttribute = new EmailAddressAttribute();
    public static WebApplication MapAuthEndpoints(this WebApplication app)
    {
        var auth = app.MapGroup("/auth").WithTags("Authentication");

        // auth.MapIdentityApi<IdentityUser>();

        auth.MapGet("me", (ClaimsPrincipal user) =>
        {
            return Results.Ok(new
            {
                isAuthenticated = true,
                userId = user.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )
            });
        }).RequireAuthorization();

        auth.MapPost("register", async (
            [FromBody] RegisterUserRequest request,
            UserManager<IdentityUser> userManager,
            PartyUpContext context) =>
        {
            if (string.IsNullOrEmpty(request.Email) || !_emailAddressAttribute.IsValid(request.Email))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["Email"] = ["O e-mail informado é inválido."]
                });
            }

            if (!string.Equals(request.Password, request.ConfirmPassword))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["ConfirmPassword"] = ["As senhas não coincidem."]
                });
            }

            var identityUser = new IdentityUser
            {
                UserName = request.Email,
                Email = request.Email
            };

            var result = await userManager.CreateAsync(identityUser, request.Password);

            if (!result.Succeeded)
            {
                return Results.BadRequest(result.Errors);
            }

            var userModel = new UserModel
            {
                IdentityId = identityUser.Id,
                UserName = request.UserName,
                Email = request.Email,
                AvatarSeed = request.UserName
            };

            context.UsersProfile.Add(userModel);
            await context.SaveChangesAsync();

            return Results.Ok(new { message = "Usuário registrado com sucesso" });
        });

        auth.MapPost("login", async (
            SignInManager<IdentityUser> signInManager,
            [FromBody] LoginRequest request) =>
        {
            var result = await signInManager.PasswordSignInAsync(
                request.Email,
                request.Password,
                isPersistent: true,
                lockoutOnFailure: true
            );

            if (result.RequiresTwoFactor)
            {
                if (!string.IsNullOrEmpty(request.TwoFactorCode))
                {
                    result = await signInManager.TwoFactorAuthenticatorSignInAsync(request.TwoFactorCode, true, true);
                }
                else if (!string.IsNullOrEmpty(request.TwoFactorRecoveryCode))
                {
                    result = await signInManager.TwoFactorRecoveryCodeSignInAsync(request.TwoFactorRecoveryCode);
                }
                else
                {
                    return Results.Problem(
                        "É necessário informar o código de autenticação de dois fatores.",
                        statusCode: StatusCodes.Status401Unauthorized
                    );
                }
            }

            if (result.IsLockedOut)
            {
                return Results.Problem(
                    "Conta temporariamente bloqueada.",
                    statusCode: StatusCodes.Status423Locked
                );
            }

            if (result.IsNotAllowed)
            {
                return Results.Problem(
                    "O login não está permitido para esta conta.",
                    statusCode: StatusCodes.Status403Forbidden
                );
            }

            if (!result.Succeeded)
            {
                return Results.Problem(
                    "E-mail ou senha inválidos.",
                    statusCode: StatusCodes.Status401Unauthorized
                );
            }

            return Results.Ok(new { message = "Usuário logado com sucesso" });

        });

        auth.MapPost("changePassword", async (
            ClaimsPrincipal principal,
            UserManager<IdentityUser> userManager,
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

        auth.MapDelete("deleteAccount", async (
            ClaimsPrincipal principal,
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager) =>
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

        auth.MapPost("/logout", async (
            SignInManager<IdentityUser> signInManager) =>
        {
            await signInManager.SignOutAsync();
            return Results.Ok(new { message = "Logout realizado com sucesso" });
        })
        .RequireAuthorization();

        return app;
    }
}