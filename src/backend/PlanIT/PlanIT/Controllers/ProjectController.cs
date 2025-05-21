using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using PlanIT.API.Mappers;
using PlanIT.DataTransferModel.Assignment;
using PlanIT.DataTransferModel.Project;
using PlanIT.DataTransferModel.User;
using PlanIT.Logging;
using PlanIT.Models;
using PlanIT.Services.Interface;
using PlanIT.Services.Logic;
using Project = PlanIT.Models.Project;

namespace PlanIT.API.Controllers
{
    [Route("api/project")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        public IProjectServices ProjectService { get; }
        private readonly ILoggger loggger;
        private readonly INotificationServices notificationService;
        public ProjectController(ILoggger loger, IProjectServices pLogic, INotificationServices notificationService)
        {
            loggger = loger;
            ProjectService = pLogic;
            this.notificationService = notificationService;
        }

        [HttpGet]
        public async Task<List<GetProjectDetailsDTO>> GetProjects()
        {
            loggger.LogInformation($"Called {nameof(GetProjects)} from ProjectController");
            return await ProjectService.GetAllProjectsAsync();
        }

        [HttpGet("{projectID}")]
        public async Task<GetProjectDTO?> Get(int projectID)
        {
            loggger.LogInformation($"Called {nameof(Get)} from ProjectController");
            var project = await ProjectService.GetProjectByID(projectID);

            return project?.ToDto();
        }
        [HttpGet("project-with-leader/{projectID}")]
        public async Task<GetProjectDetailsDTO?> GetProjectWithLeaderInformation(int projectID) {
            loggger.LogInformation($"Called {nameof(GetProjectWithLeaderInformation)} from ProjectController");
            var project = await ProjectService.GetProjectWithLeaderInformation(projectID);

            return project;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromQuery] int senderId, [FromBody] CreateProjectDTO createProjectDTO)
        {
            loggger.LogInformation($"Called {nameof(createProjectDTO)} from ProjectController");

            try
            {
                var p = await ProjectService.AddProjectAsync(createProjectDTO.FromDto());
                //if (!p) return StatusCode(500, new { Message = "Project not added" });
                int newProjectId = p.ProjectID;
                int projectLeaderID = p.ProjectLeaderID;

                await ProjectService.AddProjectLeaderToProjectAsync(newProjectId, projectLeaderID);

                if(createProjectDTO.EmployeeIds != null)
                {
                    var userIds = createProjectDTO.EmployeeIds.ToArray();
                    await ProjectService.AddEmployeesToProjectAsync(newProjectId, userIds);
                }

                notificationService.TriggerProjectNotificationForUpdate(newProjectId,createProjectDTO.EmployeeIds, senderId);
                return Ok(new { Message = "Project added successfully" });
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }
        [HttpPut("{projectID}")]
        public async Task<IActionResult> Put(int projectID, [FromQuery]int senderId, [FromBody] UpdateProjectDTO updateOpremaDto)
        {
            loggger.LogInformation($"Called {nameof(updateOpremaDto)} from ProjectController");

            try
            {
                var p = await ProjectService.UpdateProjectAsync(updateOpremaDto.FromDto(), projectID);
                if (updateOpremaDto.EmployeeIdsToAdd != null)
                {
                    var userIds = updateOpremaDto.EmployeeIdsToAdd.ToArray();
                    await ProjectService.AddEmployeesToProjectAsync(projectID, userIds); //lista usera da se doda na projekat
                }
                if (updateOpremaDto.EmployeeIdsToRemove != null)
                {
                    var userIds = updateOpremaDto.EmployeeIdsToRemove.ToArray();
                    await ProjectService.RemoveEmployeesToProjectAsync(projectID, userIds); //lista usera da se ukloni na projekat
                }
                notificationService.TriggerProjectNotificationForUpdate(projectID, updateOpremaDto.EmployeeIdsToAdd, senderId);
                notificationService.TriggerProjectNotificationForDeleteArray(projectID, updateOpremaDto.EmployeeIdsToRemove, senderId);
                return Ok(new { Message = "Project updated successfully" });

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
           

        }



        [HttpPut("archive-project")]
        public async Task Archive(int projectID, [FromQuery] int senderId)
        {
            loggger.LogInformation($"Called {nameof(Archive)} from ProjectController");
            await ProjectService.ArchiveProjectAsync(projectID);
            notificationService.TriggerProjectNotificationForDelete(projectID, senderId);
        }
        
        [HttpGet("get-user-count")]
        public async Task<int> GetUserCount(int ProjectID)
        {
            loggger.LogInformation($"Called {nameof(GetUserCount)} from ProjectController");
            var user = await ProjectService.GetUserCountForProject(ProjectID);

            return user;
        }
        [HttpGet("get-active-tasks-count")]
        public async Task<int> GetActiveTasksCount(int ProjectID)
        {
            loggger.LogInformation($"Called {nameof(GetActiveTasksCount)} from ProjectController");
            var user = await ProjectService.GetActiveTasksCountByProject(ProjectID);

            return user;
        }
        [HttpGet("get-inactive-tasks-count")]
        public async Task<int> GetInActiveTasksCount(int ProjectID)
        {
            loggger.LogInformation($"Called {nameof(GetInActiveTasksCount)} from ProjectController");
            var user = await ProjectService.GetInActiveTasksCountByProject(ProjectID);

            return user;
        }
        [HttpGet("projectName-by-assignmentID")]
        public async Task<string> GetProjectNameByAssignmentID(int assignmentID)
        {
            loggger.LogInformation($"Called {nameof(GetProjectNameByAssignmentID)} from ProjectController");

            var projectName = await ProjectService.GetProjectNameByAssignmentID(assignmentID);
            if (projectName == null)
            {
                return "Ne postoji";
            }
            return projectName;
        }
        [HttpGet("users-by-project")]
        public async Task<List<UsersByProjectDTO>> GetAllUsersByProject(int ProjectID)
        {
            loggger.LogInformation($"Called {nameof(GetAllUsersByProject)} from ProjectController");
            return await ProjectService.GetUsersByProjectID(ProjectID);
        }
        [HttpGet("assignments-by-project")]
        public async Task<ActionResult<List<GetAssignmentDTO>>> GetAllAssignmentsByProject(int ProjectID)
        {
            loggger.LogInformation($"Called {nameof(GetAllAssignmentsByProject)} from ProjectController");
            try {
                var assignments = await ProjectService.GetAssignmentsByProjectID(ProjectID);
                
                var assignmentDTOs = assignments.Select(AssignmentMapper.ToDto).ToList();

                return Ok(assignmentDTOs);
            }
            catch (Exception ex) {
                loggger.LogError($"Error in {nameof(GetAllAssignmentsByProject)}: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Internal server error" });
            }
        }
        [HttpGet("assignmentLists-by-project")]
        public async Task<List<AssignmentList>> GetAllAssignmentListsByProject(int ProjectID)
        {
            loggger.LogInformation($"Called {nameof(GetAllAssignmentListsByProject)} from ProjectController");
            return await ProjectService.GetAssignmentListsByProjectID(ProjectID);
        }
    }
}