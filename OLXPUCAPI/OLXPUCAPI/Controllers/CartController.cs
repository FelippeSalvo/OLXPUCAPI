using Microsoft.AspNetCore.Mvc;
using OLXPUCAPI.Models;
using OLXPUCAPI.Services;
using System;

namespace OLXPCAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly CartService _cartService;

        public CartController(CartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet("{userId}")]
        public IActionResult GetByUser(Guid userId)
        {
            var items = _cartService.GetByUser(userId);
            return Ok(items);
        }

        [HttpPost]
        public IActionResult Add([FromBody] CartItem item)
        {
            try
            {
                _cartService.AddOrUpdate(item.UserId, item.ProductId, item.Quantity);
                return Ok(new { message = "Item adicionado/atualizado no carrinho" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{userId}/{productId}")]
        public IActionResult Remove(Guid userId, Guid productId)
        {
            var removed = _cartService.Remove(userId, productId);
            if (!removed) return NotFound();
            return NoContent();
        }

        [HttpDelete("clear/{userId}")]
        public IActionResult Clear(Guid userId)
        {
            _cartService.Clear(userId);
            return Ok(new { message = "Carrinho limpo" });
        }
    }
}
