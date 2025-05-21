using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlanIT.API.Mappers;
using PlanIT.DataTransferModel.ProjectRole;
using PlanIT.Logging;
using PlanIT.Services.Interface;

namespace PlanIT.API.Controllers {
    [Route("api/projectRole")]
    [ApiController]
    public class ProjectRoleController : ControllerBase {
        public IProjectRoleServices projectRoleService { get; }
        private readonly ILoggger loggger;
        public ProjectRoleController(ILoggger loger, IProjectRoleServices aLogic) {
            loggger = loger;
            projectRoleService = aLogic;
        }


        [HttpGet]
        public async Task<List<GetProjectRoleDTO>> GetProjectRoles() {
            loggger.LogInformation($"Called {nameof(GetProjectRoles)} from ProjectRoleController");
            var projectRole = await projectRoleService.GetAllProjectRolesAsync();

            return projectRole.Select(ProjectRoleMapper.ToDto).ToList();
        }

        [HttpGet("{projectRoleID}")]
        public async Task<GetProjectRoleDTO?> Get(int projectRoleID) {
            loggger.LogInformation($"Called {nameof(Get)} from ProjectRoleController");
            var project = await projectRoleService.GetProjectRoleByID(projectRoleID);

            return project?.ToDto();
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CreateProjectRoleDTO createProjectRoleDTO) {
            loggger.LogInformation($"Called {nameof(CreateProjectRoleDTO)} from ProjectRoleController");

            try {
                await projectRoleService.AddProjectRoleAsync(createProjectRoleDTO.FromDto());
                return Ok(new { Message = "ProjectRole added successfully" });
            }
            catch (Exception ex) {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }


        [HttpDelete("{projectRoleID}")]
        public async Task Delete(int projectRoleID) {
            loggger.LogInformation($"Called {nameof(Delete)} from ProjectRoleController");
            await projectRoleService.DeleteProjectRoleAsync(projectRoleID);
        }

        [HttpPut("{projectRoleID}")]
        public async Task Put(int projectID, [FromBody] UpdateProjectRoleDTO updateProjectRoleDTO) {
            loggger.LogInformation($"Called {nameof(UpdateProjectRoleDTO)} from ProjectRoleController");
            await projectRoleService.UpdateProjectRoleAsync(updateProjectRoleDTO.FromDto(), projectID);

        }
    }
}
