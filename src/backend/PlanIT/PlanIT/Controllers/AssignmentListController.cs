using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.Extensions.Logging;
using PlanIT.API.Mappers;
using PlanIT.DataTransferModel.Assignment;
using PlanIT.DataTransferModel.AssignmentList;
using PlanIT.Logging;
using PlanIT.Models;
using PlanIT.Services.Interface;
using PlanIT.Services.Logic;

namespace PlanIT.API.Controllers
{
    [Route("api/assignmentList")]
    [ApiController]
    public class AssignmentListController : ControllerBase
    {
        public IAssignmentListServices AssignmentListService { get; }
        private readonly ILoggger loggger;
        private readonly IProjectServices ProjectService;
        public AssignmentListController(ILoggger loger, IAssignmentListServices alLogic, IProjectServices ProjectService)
        {
            loggger = loger;
            AssignmentListService = alLogic;
            this.ProjectService = ProjectService;
        }
        [HttpGet]
        public async Task<List<GetAssignmentListDTO>> GetAssignmentLists()
        {
            loggger.LogInformation($"Called {nameof(GetAssignmentLists)} from AssignmentListController");
            var assignmentList = await AssignmentListService.GetAllAssignmentListsAsync();

            return assignmentList.Select(AssignmentListMapper.ToDto).ToList();
        }

        [HttpGet("{assignmentListID}")]
        public async Task<GetAssignmentListDTO?> Get(int assignmentListID)
        {
            loggger.LogInformation($"Called {nameof(Get)} from AssignmentListController");
            var assignmentList = await AssignmentListService.GetAssignmentListByID(assignmentListID);

            return assignmentList?.ToDto();
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CreateAssignmentListDTO createAssignmentListDTO)
        {
            loggger.LogInformation($"Called {nameof(CreateAssignmentListDTO)} from AssignmentListController");

            try
            {
                await AssignmentListService.AddAssignmentListAsync(createAssignmentListDTO.FromDto());
                return Ok(new { Message = "Assignment list added successfully" });
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }


        [HttpDelete("{assignmentListID}")]
        public async Task Delete(int assignmentListID)
        {
            loggger.LogInformation($"Called {nameof(Delete)} from AssignmentListController");
            await AssignmentListService.DeleteAssignmentListAsync(assignmentListID);
        }

        [HttpPut("{assignmentListID}")]
        public async Task Put(int assignmentListID, [FromBody] UpdateAssignmentListDTO updateAssignmentListDTO)
        {
            loggger.LogInformation($"Called {nameof(updateAssignmentListDTO)} from AssignmentListController");
            await AssignmentListService.UpdateAssignmentListAsync(updateAssignmentListDTO.FromDto(), assignmentListID);

        }
        [HttpGet("project/{projectId}")]
        public async Task<List<GetAssignmentListDTO>> GetAssignmentListsForProject(int projectId)
        {
            loggger.LogInformation($"Called {nameof(GetAssignmentListsForProject)} from AssignmentListController");

            var assignmentLists = await AssignmentListService.GetAssignmentListsForProjectAsync(projectId);

            return assignmentLists.Select(AssignmentListMapper.ToDto).ToList();
        }
        [HttpGet("project/{projectId}/user/{userId}")]
        public async Task<List<GetAssignmentDTO>> GetAssignmentsForProjectAndUserAsync(int projectId, int userId) 
        {
            loggger.LogInformation($"Called {nameof(GetAssignmentsForProjectAndUserAsync)} from AssignmentListController");

            var assignments = await AssignmentListService.GetAssignmentsForProjectAndUserAsync(projectId, userId);

            return assignments.Select(AssignmentMapper.ToDto).ToList();
        }
        [HttpGet("project-manager/{projectId}/user/{userId}")]
        public async Task<ActionResult<List<GetAssignmentDTO>>> GetAssignmentsForProjectAndUserForManagerAsync(int projectId, int userId) {
            loggger.LogInformation($"Called {nameof(GetAssignmentsForProjectAndUserForManagerAsync)} from AssignmentListController");

            try {
                var project = await ProjectService.GetProjectByID(projectId);
                List<Assignment> assignments;

                if (project.ProjectLeader.UserID != userId) { //  ako nije menadzer na tom projektu, pozvati  assignmentList/project/${Id}/user/${UserID}
                    assignments = await AssignmentListService.GetAssignmentsForProjectAndUserAsync(projectId, userId);
                }
                else {
                    // Fetch assignments for provided projectID
                    assignments = await ProjectService.GetAssignmentsByProjectID(projectId);
                }

                var assignmentDTOs = assignments.Select(AssignmentMapper.ToDto).ToList();

                return Ok(assignmentDTOs);
            }
            catch(Exception ex) {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }
        

        [HttpGet("assignment/{assignmentListId}/user/{userId}")]
        public async Task<ActionResult<List<GetAssignmentDTO>>> GetAssignmentsForAssignmentListAndUserAsync(int assignmentListId, int userId) {
            try {
                loggger.LogInformation($"Called {nameof(GetAssignmentsForAssignmentListAndUserAsync)} from AssignmentListController");

                // Check if the user is the project leader for the project associated with the assignment list
                
                /*
                var assignmentList = await AssignmentListService.GetAssignmentListByID(assignmentListId);
                var projectId = assignmentList.ProjectID;
                var project = await ProjectService.GetProjectByID(projectId);

                loggger.LogWarning(project.ProjectID +" " +project.ProjectLeaderID);

                List<Assignment> assignments;

                if (project.ProjectLeaderID == userId) {
                    // User is the project leader, fetch all assignments for the project
                    assignments =  await AssignmentListService.GetAssignmentsByAssignmentListID(assignmentListId);
                }
                else {*/
                    var assignments = await AssignmentListService.GetAssignmentsForAssignmentListAndUserAsync(assignmentListId, userId);
                //}
                // User is not the project leader, fetch assignments for the assignment list and user
               
                return assignments.Select(AssignmentMapper.ToDto).ToList();
            }
            catch(Exception ex) {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }
        [HttpGet("get-assignments-by-assignmentListID")]
        public async Task<List<GetAssignmentDTO>> GetAssignmentsByList(int AssignmentListID)
        {
            loggger.LogInformation($"Called {nameof(GetAssignmentsByList)} from AssignmentListController");
            var assignments = await AssignmentListService.GetAssignmentsByAssignmentListID(AssignmentListID);
            return assignments.Select(AssignmentMapper.ToDto).ToList();
        }
        
    }
}
