namespace OLXPUCAPI.Models
{
    public class Product : IEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public Guid OwnerId { get; set; } // referência ao dono (usuário)
        public string Category { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
    }
}
