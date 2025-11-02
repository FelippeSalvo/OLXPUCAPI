using Microsoft.AspNetCore.Mvc;
using OLXPUCAPI.Models;
using OLXPUCAPI.Services;
using System;

namespace OLXPCAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_userService.GetAll());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(Guid id)
        {
            var user = _userService.GetById(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPut("{id}")]
        public IActionResult Update(Guid id, [FromBody] User user)
        {
            if (id != user.Id) return BadRequest(new { message = "ID do usuário não corresponde" });
            
            var updated = _userService.Update(user);
            if (!updated) return NotFound(new { message = "Usuário não encontrado" });
            
            // Retorna o usuário atualizado do repositório para garantir que todos os campos estão corretos
            var updatedUser = _userService.GetById(id);
            if (updatedUser == null) return NotFound(new { message = "Usuário não encontrado após atualização" });
            
            return Ok(updatedUser);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            var deleted = _userService.Delete(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
