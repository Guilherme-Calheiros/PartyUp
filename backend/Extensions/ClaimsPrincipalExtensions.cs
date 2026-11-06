using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using PartyUp.Models;

namespace PartyUp.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static async Task<(UserModel? Profile, bool IsAuthenticated)>
        GetProfileAsync(this ClaimsPrincipal user, PartyUpContext context)
    {
        var identityId = user.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (identityId is null)
        {
            return (null, false);
        }

        var profile = await context.UsersProfile
            .FirstOrDefaultAsync(p => p.IdentityId == identityId);

        return (profile, true);
    }
}
