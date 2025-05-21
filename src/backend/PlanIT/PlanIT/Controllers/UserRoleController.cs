using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlanIT.API.Mappers;
using PlanIT.DataTransferModel.User;
using PlanIT.DataTransferModel.UserRole;
using PlanIT.Logging;
using PlanIT.Services.Interface;
using PlanIT.Services.Logic;

namespace PlanIT.API.Controllers {
    [Route("api/userRole")]
    [ApiController]
    public class UserRoleController : ControllerBase {
        public IUserRoleServices userRoleService { get; }
        private readonly ILoggger loggger;
        public UserRoleController(ILoggger loger, IUserRoleServices aLogic) {
            loggger = loger;
            userRoleService = aLogic;
        }


        [HttpGet]
        public async Task<List<GetUserRoleDTO>> GetUserRoles() {
            loggger.LogInformation($"Called {nameof(GetUserRoles)} from UserRoleController");
            var userRole = await userRoleService.GetAllUserRolesAsync();

            return userRole.Select(UserRoleMapper.ToDto).ToList();
        }

        [HttpGet("{userRoleID}")]
        public async Task<GetUserRoleDTO?> Get(int userRoleID) {
            loggger.LogInformation($"Called {nameof(Get)} from UserRoleController");
            var user = await userRoleService.GetUserRoleByID(userRoleID);

            return user?.ToDto();
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CreateUserRoleDTO createUserRoleDTO) {
            loggger.LogInformation($"Called {nameof(CreateUserRoleDTO)} from UserRoleController");

            try {
                await userRoleService.AddUserRoleAsync(createUserRoleDTO.FromDto());
                return Ok(new { Message = "UserRole added successfully" });
            }
            catch (Exception ex) {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }


        [HttpDelete("{userRoleID}")]
        public async Task Delete(int userRoleID) {
            loggger.LogInformation($"Called {nameof(Delete)} from UserRoleController");
            await userRoleService.DeleteUserRoleAsync(userRoleID);
        }

        [HttpPut("{userRoleID}")]
        public async Task Put(int userID, [FromBody] UpdateUserRoleDTO updateUserRoleDTO) {
            loggger.LogInformation($"Called {nameof(UpdateUserRoleDTO)} from UserRoleController");
            await userRoleService.UpdateUserRoleAsync(updateUserRoleDTO.FromDto(), userID);

        }
    }
}
