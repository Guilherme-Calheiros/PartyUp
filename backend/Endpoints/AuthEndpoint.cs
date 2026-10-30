using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using PartyUp.Contracts.Auth;
using PartyUp.Models;
using Resend;

namespace PartyUp.Endpoints;

public static class AuthEndpoints
{
    private static readonly EmailAddressAttribute _emailAddressAttribute = new EmailAddressAttribute();

    private static string GetChangePasswordErrorMessage(IdentityError error) =>
        error.Code switch
        {
            "PasswordMismatch" => "A senha atual está incorreta.",
            "PasswordTooShort" => "A nova senha é muito curta.",
            "PasswordTooLong" => "A nova senha é muito longa.",
            "PasswordRequiresNonAlphanumeric" => "A nova senha deve conter pelo menos um caractere especial.",
            "PasswordRequiresDigit" => "A nova senha deve conter pelo menos um número.",
            "PasswordRequiresLower" => "A nova senha deve conter pelo menos uma letra minúscula.",
            "PasswordRequiresUpper" => "A nova senha deve conter pelo menos uma letra maiúscula.",
            "PasswordRequiresUniqueChars" => "A nova senha deve conter mais caracteres diferentes.",
            _ => "Não foi possível alterar a senha."
        };

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

        auth.MapPost("forgotPassword", async (
            UserManager<IdentityUser> userManager,
            IResend resend,
            IConfiguration configuration,
            [FromBody] ForgotPasswordRequest request) =>
        {
            var user = await userManager.FindByEmailAsync(request.Email);

            if (user is not null)
            {
                var token =
                    await userManager.GeneratePasswordResetTokenAsync(user);

                var encodedToken = WebEncoders.Base64UrlEncode(
                    Encoding.UTF8.GetBytes(token)
                );

                var frontendUrl = configuration["FrontendUrl"] ?? throw new InvalidOperationException("FrontendUrl não configurada");
                var emailFrom = configuration["EmailFrom"] ?? throw new InvalidOperationException("Email de envio não configurado");

                var resetUrl =
                    $"{frontendUrl.TrimEnd('/')}/reset-password" +
                    $"?email={Uri.EscapeDataString(user.Email!)}" +
                    $"&token={Uri.EscapeDataString(encodedToken)}";

                var email = new EmailMessage
                {
                    From = $"PartyUp <{emailFrom}>",
                    Subject = "Redefinição de senha - PartyUp",
                    HtmlBody = $"""
                        <h1>Redefinir sua senha</h1>
                        <p>Recebemos uma solicitação para redefinir
                        a senha da sua conta PartyUp.</p>
                        <p>
                            <a href="{resetUrl}">
                                Redefinir minha senha
                            </a>
                        </p>
                        <p>Se você não solicitou essa alteração,
                        ignore este e-mail.</p>
                        """,
                    TextBody = $"""
                        Para redefinir sua senha do PartyUp, acesse:
                        {resetUrl}

                        Se você não solicitou essa alteração,
                        ignore este e-mail.
                        """
                };

                email.To.Add(user.Email!);

                await resend.EmailSendAsync(email);
            }

            return Results.Ok(new
            {
                message = "Se a conta existir, você receberá as instruções por e-mail."
            });
        });

        auth.MapPost("resetPassword", async (
            UserManager<IdentityUser> userManager,
            [FromBody] ResetPasswordRequest request) =>
        {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user is null)
            {
                return Results.BadRequest(new
                {
                    message = "Não foi possível redefinir a senha."
                });
            }

            var decodedToken = Encoding.UTF8.GetString(
                WebEncoders.Base64UrlDecode(request.ResetCode)
            );

            var result = await userManager.ResetPasswordAsync(
                user,
                decodedToken,
                request.NewPassword
            );

            if (!result.Succeeded)
            {
                return Results.BadRequest(new
                {
                    errors = result.Errors.Select(error => new
                    {
                        error.Code,
                        error.Description
                    })
                });
            }

            return Results.Ok(new
            {
                message = "Senha redefinida com sucesso."
            });

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
                return Results.BadRequest(result.Errors.Select(error => new
                {
                    error.Code,
                    Description = GetChangePasswordErrorMessage(error)
                }));
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