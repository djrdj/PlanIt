using Microsoft.AspNetCore.Mvc;
using NikolaLalicDemo.API.Mappers;
using NikolaLalicDemo.BussinesLogic;
using NikolaLalicDemo.BussinesLogic.Interfaces;
using NikolaLalicDemo.DataAccessLayer;
using NikolaLalicDemo.DataTransferModel;
using NikolaLalicDemo.Models;

namespace NikolaLalicDemo.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserLogic _context;
        public AuthController(IUserLogic context)
        {
            _context = context;
        }
        [HttpPost("login")]
        public IActionResult Login([FromBody] User User)
        {
            
            if (User == null)
            {
                return BadRequest("Invalid login model");
            }
            var user = _context.GetUserByLogIn(User.Username, User.Password);
            if (user != null)
            {
                return Ok();
            }
            return Unauthorized("Invalid username or password");
        }

    }

}
