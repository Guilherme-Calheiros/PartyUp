using Resend;

var builder = WebApplication.CreateBuilder(args);

builder.AddServices();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/openapi/v1.json",
            "PartyUp API v1"
        );
    });
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () =>
{
    return Results.Ok($"Hello World!");
});

app.MapGet("/health/db", async (PartyUpContext db) =>
{
    var canConnect = await db.Database.CanConnectAsync();

    return canConnect
        ? Results.Ok(new { database = "connected"})
        : Results.Problem("Não foi possível conectar ao banco.");
});

app.MapAuthEndpoints();
app.MapProfileEndpoints();

app.Run();
