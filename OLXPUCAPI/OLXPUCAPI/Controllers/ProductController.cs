using Microsoft.AspNetCore.Mvc;
using OLXPUCAPI.Models;
using OLXPUCAPI.Services;
using System;

namespace OLXPCAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ProductService _productService;

        public ProductsController(ProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_productService.GetAll());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(Guid id)
        {
            var product = _productService.GetById(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpGet("owner/{ownerId}")]
        public IActionResult GetByOwner(Guid ownerId)
        {
            var list = _productService.GetByOwner(ownerId);
            return Ok(list);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Product product)
        {
            // Validação básica
            if (product == null)
            {
                return BadRequest(new { message = "Dados do produto não fornecidos" });
            }

            if (string.IsNullOrWhiteSpace(product.Title))
            {
                return BadRequest(new { message = "O título do produto é obrigatório" });
            }

            if (string.IsNullOrWhiteSpace(product.Description))
            {
                return BadRequest(new { message = "A descrição do produto é obrigatória" });
            }

            if (product.Price <= 0)
            {
                return BadRequest(new { message = "O preço deve ser maior que zero" });
            }

            if (product.OwnerId == Guid.Empty)
            {
                return BadRequest(new { message = "O ID do proprietário é obrigatório" });
            }

            try
            {
                var created = _productService.Create(product);
                return Ok(created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao criar produto", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(Guid id, [FromBody] Product product)
        {
            if (id != product.Id) return BadRequest();
            var updated = _productService.Update(product);
            if (!updated) return NotFound();
            return Ok(product);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            var deleted = _productService.Delete(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
