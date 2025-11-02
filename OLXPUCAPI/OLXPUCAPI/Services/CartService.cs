using System;
using System.Collections.Generic;
using System.Linq;
using OLXPUCAPI.Models;
using OLXPUCAPI.Repositories;

namespace OLXPUCAPI.Services
{
    public class CartService
    {
        private readonly JsonRepository<CartItem> _repo;
        private readonly JsonRepository<Product> _productRepo;

        public CartService(JsonRepository<CartItem> repo, JsonRepository<Product> productRepo)
        {
            _repo = repo;
            _productRepo = productRepo;
        }

        // retorna todos os itens do carrinho de um usuário
        public IEnumerable<CartItem> GetByUser(Guid userId)
        {
            return _repo.GetAll().Where(c => c.UserId == userId);
        }

        // adiciona ou atualiza quantidade
        public void AddOrUpdate(Guid userId, Guid productId, int quantity = 1)
        {
            if (quantity <= 0) quantity = 1;

            // garante que o produto exista (opcional)
            var prod = _productRepo.GetById(productId);
            if (prod == null) throw new ArgumentException("Produto não encontrado", nameof(productId));

            var list = _repo.GetAll().ToList();
            var existing = list.FirstOrDefault(c => c.UserId == userId && c.ProductId == productId);
            if (existing != null)
            {
                existing.Quantity = Math.Max(1, existing.Quantity + quantity);
                _repo.Update(existing);
                return;
            }

            var item = new CartItem
            {
                UserId = userId,
                ProductId = productId,
                Quantity = Math.Max(1, quantity)
            };
            _repo.Add(item);
        }

        // remove item específico do carrinho do usuário
        public bool Remove(Guid userId, Guid productId)
        {
            var item = _repo.GetAll().FirstOrDefault(c => c.UserId == userId && c.ProductId == productId);
            if (item == null) return false;
            _repo.Delete(item.Id);
            return true;
        }

        // limpa o carrinho do usuário
        public void Clear(Guid userId)
        {
            var list = _repo.GetAll().Where(c => c.UserId != userId).ToList();
            // sobrescreve arquivo com apenas itens de outros usuários
            // o JsonRepository não expõe um WriteAll público, então removemos individualmente:
            foreach (var item in _repo.GetAll().Where(c => c.UserId == userId).ToList())
            {
                _repo.Delete(item.Id);
            }
        }
    }
}
