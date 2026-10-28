using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace PartyUp.Extensions;

public static class BuilderExtensions
{
    public static WebApplicationBuilder AddServices(this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string não configurada");
        var frontendUrl = builder.Configuration["FrontendUrl"] ?? throw new InvalidOperationException("FrontendUrl não configurada");


        builder.Services.AddOpenApi();

        builder.Services.AddDbContext<PartyUpContext>(opt => 
            opt.UseNpgsql(connectionString));

        builder.Services.AddAuthorization();

        builder.Services
            .AddIdentityApiEndpoints<IdentityUser>()
            .AddEntityFrameworkStores<PartyUpContext>();

        builder.Services.AddCors(opt =>
        {
            opt.AddPolicy("Frontend", policy =>
            {
                policy
                    .WithOrigins(frontendUrl)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        builder.Services.ConfigureApplicationCookie(opt =>
        {
            opt.ExpireTimeSpan = TimeSpan.FromDays(7);
            opt.SlidingExpiration = true;
        });

        return builder;
    }
}