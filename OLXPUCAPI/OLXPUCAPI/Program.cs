using OLXPUCAPI.Repositories;
using OLXPUCAPI.Services;
using OLXPUCAPI.Models;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// --- Configuração básica ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configura JSON para manter PascalCase (compatível com o modelo C#)
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        // Inclui propriedades null na serialização
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never;
    });
builder.Services.AddEndpointsApiExplorer();

// --- Swagger ---
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "OLXPCAPI", Version = "v1" });
});

// --- CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.SetIsOriginAllowed(origin => true) // Permite qualquer origem em desenvolvimento
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

// --- Injeção de dependência (iremos criar os arquivos em seguida) ---
builder.Services.AddSingleton<JsonRepository<User>>(sp => new JsonRepository<User>("Data/users.db"));
builder.Services.AddSingleton<JsonRepository<Product>>(sp => new JsonRepository<Product>("Data/products.db"));
builder.Services.AddSingleton<JsonRepository<CartItem>>(sp => new JsonRepository<CartItem>("Data/cart.db"));

builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<ProductService>();
builder.Services.AddSingleton<CartService>();

var app = builder.Build();

// --- Pipeline ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "OLXPCAPI v1"));
}

// CORS deve vir antes de UseAuthorization
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

// Garante que a pasta Data exista
Directory.CreateDirectory("Data");

app.Run();
