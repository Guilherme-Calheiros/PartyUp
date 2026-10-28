using System.ComponentModel.DataAnnotations;

namespace PartyUp.Contracts.Auth;

public sealed class RegisterUserRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; init; }
    [Required]
    public required string UserName { get; init; }
    [Required]
    public required string Password { get; init; }
    [Compare(nameof(Password), ErrorMessage = "As senhas não coincidem.")]
    public required string ConfirmPassword { get; init; }
}