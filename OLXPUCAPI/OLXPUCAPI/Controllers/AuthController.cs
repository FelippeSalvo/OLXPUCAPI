using Microsoft.AspNetCore.Mvc;
using OLXPUCAPI.Services;
using OLXPUCAPI.Models;

namespace OLXPCAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;

        public AuthController(UserService userService)
        {
            _userService = userService;
        }

        // POST api/auth/register
        [HttpPost("register")]
        public IActionResult Register([FromBody] User user)
        {
            var result = _userService.Create(user.Name, user.Email, user.Password, user.Role);
            if (!result.Success) return BadRequest(new { message = result.Error });
            return Ok(result.Created);
        }

        // POST api/auth/login
        [HttpPost("login")]
        public IActionResult Login([FromBody] User user)
        {
            var logged = _userService.Authenticate(user.Email, user.Password);
            if (logged == null) return Unauthorized(new { message = "Credenciais inválidas" });
            return Ok(logged);
        }
    }
}
