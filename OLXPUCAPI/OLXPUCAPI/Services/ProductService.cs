using System;
using System.Collections.Generic;
using System.Linq;
using OLXPUCAPI.Models;
using OLXPUCAPI.Repositories;

namespace OLXPUCAPI.Services
{
    public class ProductService
    {
        private readonly JsonRepository<Product> _repo;

        public ProductService(JsonRepository<Product> repo)
        {
            _repo = repo;
        }

        public IEnumerable<Product> GetAll()
        {
            return _repo.GetAll();
        }

        public IEnumerable<Product> GetByOwner(Guid ownerId)
        {
            return _repo.GetAll().Where(p => p.OwnerId == ownerId);
        }

        public Product? GetById(Guid id)
        {
            return _repo.GetById(id);
        }

        public Product Create(Product product)
        {
            // ensure id is set
            if (product.Id == Guid.Empty) product.Id = Guid.NewGuid();
            _repo.Add(product);
            return product;
        }

        public bool Update(Product product)
        {
            var existing = _repo.GetById(product.Id);
            if (existing == null) return false;

            _repo.Update(product);
            return true;
        }

        public bool Delete(Guid id)
        {
            var existing = _repo.GetById(id);
            if (existing == null) return false;

            _repo.Delete(id);
            return true;
        }
    }
}
