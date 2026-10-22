using Amazon;
using Amazon.DynamoDBv2;
using Amazon.Runtime;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using SuporteHub.API.Models;
using SuporteHub.API.Storage;
using System.Threading.RateLimiting;

// Resolve configuration and frontend from the built application, regardless of cwd.
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory,
    WebRootPath = "wwwroot"
});
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<PasswordHasher<Conta>>();
builder.Services.AddSingleton<IAmazonDynamoDB>(_ =>
{
    var endpoint = builder.Configuration["DynamoDb:ServiceUrl"];
    var region = builder.Configuration["DynamoDb:Region"] ?? "us-east-1";
    if (!string.IsNullOrEmpty(endpoint))
    {
        var uri = new Uri(endpoint);
        if (!uri.IsLoopback || !builder.Environment.IsDevelopment())
            throw new InvalidOperationException("ServiceUrl é permitido apenas em loopback no ambiente Development. Para AWS, use Region e as credenciais padrão do SDK.");
        return new AmazonDynamoDBClient(new BasicAWSCredentials("local", "local"), new AmazonDynamoDBConfig { ServiceURL = endpoint, AuthenticationRegion = region });
    }
    return new AmazonDynamoDBClient(new AmazonDynamoDBConfig { RegionEndpoint = RegionEndpoint.GetBySystemName(region) });
});
var provider = builder.Configuration["Storage:Provider"] ?? "Sqlite";
if (provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
    builder.Services.AddSingleton<IAppStore, SqliteStore>();
else if (provider.Equals("DynamoDb", StringComparison.OrdinalIgnoreCase))
    builder.Services.AddSingleton<IAppStore, DynamoStore>();
else
    throw new InvalidOperationException("Storage:Provider deve ser Sqlite ou DynamoDb.");
var keyPath = builder.Configuration["Storage:KeysPath"] ?? ".local/keys";
builder.Services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo(Path.GetFullPath(keyPath))).SetApplicationName("SuporteHub");
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(o =>
{
    o.Cookie.Name = "SuporteHub.Session"; o.Cookie.HttpOnly = true; o.Cookie.SameSite = SameSiteMode.Strict;
    o.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; o.ExpireTimeSpan = TimeSpan.FromHours(8); o.SlidingExpiration = true;
    o.Events.OnRedirectToLogin = context => { context.Response.StatusCode = 401; return Task.CompletedTask; };
    o.Events.OnRedirectToAccessDenied = context => { context.Response.StatusCode = 403; return Task.CompletedTask; };
});
builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = 429;
    o.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "local",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 30, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});
var app = builder.Build();
var store = app.Services.GetRequiredService<IAppStore>();
await store.InitializeAsync();

// Administrative provisioning is available only to an operator with server access.
if (args.Contains("--promote-admin"))
{
    Console.Write("E-mail da conta existente: ");
    var email = (Console.ReadLine() ?? "").Trim().ToLowerInvariant();
    var entry = await store.Get<Conta>("USERS", email)
        ?? throw new InvalidOperationException("Conta não encontrada. Cadastre-a primeiro.");
    var account = entry.Value; account.Perfil = "admin";
    await store.Put("USERS", email, account, entry.Version);
    Console.WriteLine("Administrador configurado. Entre novamente para atualizar a sessão.");
    return;
}

// Explicit provisioning command; normal registration can only create customers.
if (args.Contains("--create-agent") || args.Contains("--create-admin"))
{
    Console.Write("E-mail da nova conta: "); var email = (Console.ReadLine() ?? "").Trim().ToLowerInvariant();
    Console.Write("Nome: "); var name = (Console.ReadLine() ?? "").Trim();
    Console.Write("Senha (mínimo 10 caracteres): ");
    var password = "";
    if (Console.IsInputRedirected) password = Console.ReadLine() ?? "";
    else { for (ConsoleKeyInfo key; (key = Console.ReadKey(true)).Key != ConsoleKey.Enter;) { if (key.Key == ConsoleKey.Backspace) { if (password.Length > 0) password = password[..^1]; } else if (!char.IsControl(key.KeyChar)) password += key.KeyChar; } Console.WriteLine(); }
    if (!new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(email) || email.Length > 254 || name.Length is < 2 or > 100 || password.Length is < 10 or > 128)
        throw new InvalidOperationException("E-mail, nome ou senha inválidos.");
    var account = new Conta { Email = email, Nome = name, Perfil = args.Contains("--create-admin") ? "admin" : "agent" };
    account.SenhaHash = app.Services.GetRequiredService<PasswordHasher<Conta>>().HashPassword(account, password);
    await store.Put("USERS", email, account);
    Console.WriteLine(args.Contains("--create-admin") ? "Administrador criado." : "Agente criado."); return;
}

app.UseExceptionHandler(handler => handler.Run(async context =>
{
    context.Response.StatusCode = 503;
    await context.Response.WriteAsJsonAsync(new { mensagem = "Não foi possível acessar o armazenamento. Tente novamente." });
}));
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.Headers.CacheControl = "no-store";
        if (!HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method)
            && context.Request.Headers["X-Requested-With"] != "SuporteHub")
        { context.Response.StatusCode = 400; await context.Response.WriteAsJsonAsync(new { mensagem = "Requisição inválida." }); return; }
    }
    await next();
});
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
if (app.Environment.IsDevelopment()) app.MapOpenApi();
app.MapGet("/api/health", async () => { await store.Get<object>("META", "READINESS"); return Results.Ok(new { status = "ok", database = store.ProviderName }); });
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
await app.RunAsync();
