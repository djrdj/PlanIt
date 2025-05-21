using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlanIT.API.Mappers;
using PlanIT.DataTransferModel.Project;
using PlanIT.DataTransferModel.User;
using PlanIT.DataTransferModel.User_Project;
using PlanIT.Logging;
using PlanIT.Models;
using PlanIT.Services.Interface;

namespace PlanIT.API.Controllers {
    [Route("api/userProject")]
    [ApiController]
    public class User_ProjectController : ControllerBase {
        public IUser_ProjectServices UserProjectService { get; }
        private readonly ILoggger loggger;
        public User_ProjectController(ILoggger loger, IUser_ProjectServices aLogic) {
            loggger = loger;
            UserProjectService = aLogic;
        }

        [HttpGet]
        public async Task<List<GetUserProjectDTO>> GetUserProjects() {
            loggger.LogInformation($"Called {nameof(GetUserProjects)} from UserProjectController");
            var userProject = await UserProjectService.GetAllUserProjectsAsync();

            return userProject.Select(UserProjectMapper.ToDto).ToList();
        }

        [HttpGet("projects-by-userID")]
        public async Task<List<GetProjectDTO?>> GetProjectsForUser(int userID) {
            loggger.LogInformation($"Called {nameof(GetProjectsForUser)} from UserProjectController");
            var projects = await UserProjectService.GetProjectsByUserID(userID);

            return projects?.Select(ProjectMapper.ToDto).ToList();
        }
        [HttpGet("project-count-by-userID")]
        public async Task<int> GetProjectCountForUser(int userID)
        {
            try
            {
                loggger.LogInformation($"Called {nameof(GetProjectCountForUser)} from UserProjectController");
                return await UserProjectService.GetProjectCountByUserID(userID);

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return -1;
            }
        }
        [HttpGet("active-project-count-by-userID")]
        public async Task<int> GetActiveProjectCountForUser(int userID)
        {
            try
            {
                loggger.LogInformation($"Called {nameof(GetActiveProjectCountForUser)} from UserProjectController");
                return await UserProjectService.GetActiveProjectCountByUserID(userID);

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return -1;
            }
        }
        [HttpGet("planned-project-count-by-userID")]
        public async Task<int> GetPlannedProjectCountForUser(int userID)
        {
            try
            {
                loggger.LogInformation($"Called {nameof(GetPlannedProjectCountForUser)} from UserProjectController");
                return await UserProjectService.GetPlannedProjectCountByUserID(userID);

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return -1;
            }
        }
        [HttpGet("completed-project-count-by-userID")]
        public async Task<int> GetCompletedProjectCountForUser(int userID)
        {
            try
            {
                loggger.LogInformation($"Called {nameof(GetCompletedProjectCountForUser)} from UserProjectController");
                return await UserProjectService.GetCompletedProjectCountByUserID(userID);

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return -1;
            }
        }

        [HttpGet("users-by-projectID")]
        public async Task<List<GetUserDTO>> GetUsersForProject(int projectID) {
            loggger.LogInformation($"Called {nameof(GetUsersForProject)} from UserProjectController");
            var users = await UserProjectService.GetUsersByProjectID(projectID);

            return users?.Select(UserMapper.ToDto).ToList();
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CreateUserProjectDTO createUserProjectDTO) {
            loggger.LogInformation($"Called {nameof(createUserProjectDTO)} from UserProjectController");

            try {
                User_Project flag = new User_Project();
                flag = await UserProjectService.AddUserProjectAsync(createUserProjectDTO.FromDto());
                if(flag !=null)
                {
                    await UserProjectService.AddKanbanColumnsForUserInProjectAsync(createUserProjectDTO.UserID, createUserProjectDTO.ProjectID);
                }
                return Ok(new { Message = "User_Project added successfully" });
            }
            catch (Exception ex) {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }


        [HttpDelete("{userID}/{projectID}")]
        public async Task Delete(int userID, int projectID) {
            loggger.LogInformation($"Called {nameof(Delete)} from UserProjectController");
            await UserProjectService.DeleteUserProjectAsync(userID, projectID);
        }
    }
}
