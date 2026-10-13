using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace PartyUp.Data;

public class PartyUpContext : IdentityDbContext<IdentityUser>
{
    public PartyUpContext(DbContextOptions<PartyUpContext> options) :
        base(options) { }

    
}