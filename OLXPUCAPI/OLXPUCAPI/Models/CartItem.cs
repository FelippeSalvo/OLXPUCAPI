namespace OLXPUCAPI.Models
{
    public class CartItem : IEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; } // quem adicionou
        public Guid ProductId { get; set; } // qual produto
        public int Quantity { get; set; } = 1;
    }
}
