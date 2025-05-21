using Hangfire.Logging.LogProviders;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.Extensions.Logging;
using PlanIT.API.Mappers;
using PlanIT.DataTransferModel.Assignment;
using PlanIT.DataTransferModel.Project;
using PlanIT.Logging;
using PlanIT.Models;
using PlanIT.Services.Interface;
using PlanIT.Services.Logic;


namespace PlanIT.API.Controllers
{
    [Route("api/assignment")]
    [ApiController]
    public class AssignmentController : ControllerBase
    {
        public IAssignmentServices AssignmentService { get; }
        private readonly ILoggger loggger;
        private readonly IProjectServices ProjectService;
        private readonly IAssignmentListServices AssignmentListService;
        private readonly INotificationServices notificationService;
        public AssignmentController(ILoggger loger, IAssignmentServices aLogic, IAssignmentListServices assignmentListServices, IProjectServices ProjectService, INotificationServices notificationService)
        {
            loggger = loger;
            AssignmentService = aLogic;
            this.ProjectService = ProjectService;
            this.AssignmentListService = assignmentListServices;
            this.notificationService = notificationService;
        }

        [HttpGet]
        public async Task<List<GetAssignmentDTO>> GetAssignments()
        {
            loggger.LogInformation($"Called {nameof(GetAssignments)} from AssignmentController");
            var assignment = await AssignmentService.GetAllAssignmentsAsync();

            return assignment.Select(AssignmentMapper.ToDto).ToList();
        }

        [HttpGet("{assignmentID}")]
        public async Task<GetAssignmentDTO?> Get(int assignmentID)
        {
            loggger.LogInformation($"Called {nameof(Get)} from AssignmentController");
            var assignment = await AssignmentService.GetAssignmentByID(assignmentID);

            return assignment?.ToDto();
        }


        // Dobijanje taskova za odredjenog korisnika
        [HttpGet("get-assignment-by-user")]
        public async Task<ActionResult<List<GetAssignmentByUserDTO>>> GetAssignmentsForUser(int userId) {
            loggger.LogInformation($"Called: {nameof(GetAssignmentsForUser)} from AssignmentController");

            try {
                var assignments = await AssignmentService.GetAssignmentsForUserAsync(userId);
                return Ok(assignments);
            }
            catch (Exception ex) {
                loggger.LogError($"Error in {nameof(GetAssignmentsForUser)}: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Internal server error" });
            }
        }

        [HttpGet("get-assignments-by-project-manager")]
        public async Task<ActionResult<List<GetAssignmentByUserDTO>>> GetAssignmentsByProjectManager(int managerID) {
            loggger.LogInformation($"Called: {nameof(GetAssignmentsByProjectManager)} from AssignmentController");

            try {
                // Get assignments for the given managerID
                var assignments = await AssignmentService.GetAssignmentsForProjectLeadAsync(managerID);
                return Ok(assignments);
            }
            catch (Exception ex) {
                loggger.LogError($"Error in {nameof(GetAssignmentsByProjectManager)}: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Internal server error" });
            }
        }

        [HttpGet("get-assignment-count-by-user")]
        public async Task<int> GetAssignmentCountForUser(int userId)
        {
            loggger.LogInformation($"Called: {nameof(GetAssignmentCountForUser)} from AssignmentController");

            try
            {
                return await AssignmentService.GetAssignmentCountForUserAsync(userId);
                
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(GetAssignmentCountForUser)}: {ex.Message}");
                return -1;
            }
        }

        [HttpGet("get-active-assignment-count-by-user")]
        public async Task<int> GetActiveAssignmentCountForUser(int userId)
        {
            loggger.LogInformation($"Called: {nameof(GetActiveAssignmentCountForUser)} from AssignmentController");

            try
            {
                return await AssignmentService.GetActiveAssignmentCountForUserAsync(userId);

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(GetActiveAssignmentCountForUser)}: {ex.Message}");
                return -1;
            }
        }
        [HttpGet("get-completed-assignment-count-by-user")]
        public async Task<int> GetCompletedAssignmentCountForUser(int userId)
        {
            loggger.LogInformation($"Called: {nameof(GetCompletedAssignmentCountForUser)} from AssignmentController");

            try
            {
                return await AssignmentService.GetCompletedAssignmentCountForUserAsync(userId);

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(GetCompletedAssignmentCountForUser)}: {ex.Message}");
                return -1;
            }
        }
        [HttpPost]
        public async Task<IActionResult> Post([FromQuery]int senderId, [FromBody] CreateAssignmentDTO createAssignmentDTO)
        {
            loggger.LogInformation($"Called {nameof(CreateAssignmentDTO)} from AssignmentController");

            try {
                var p = await AssignmentService.AddAssignmentAsync(createAssignmentDTO.FromDto());
                int newAssignmentID = p.AssignmentID;
                
                if (p.AssignmentLeadID != null) 
                {

                    int assignmentLeadID = (int)p.AssignmentLeadID;
                    

                    await AssignmentService.AddAssignmentLeaderToAssignmentAsync(newAssignmentID, assignmentLeadID);
                    loggger.LogInformation($"Added leader {assignmentLeadID} to assignment: {newAssignmentID}");
                }
                else 
                {
                    loggger.LogInformation($"No leader assigned to assignment: {newAssignmentID}");
                }

                if (createAssignmentDTO.EmployeeIds != null && createAssignmentDTO.EmployeeIds.Any()) 
                {
                    var userIds = createAssignmentDTO.EmployeeIds.ToArray();
                    await AssignmentService.AddEmployeesToAssignmentAsync(newAssignmentID, userIds);
                }
                else 
                {
                    loggger.LogInformation($"No employees assigned to assignment: {newAssignmentID}");
                }
                notificationService.TriggerTaskNotificationForUpdate(newAssignmentID, createAssignmentDTO.EmployeeIds, senderId);
                return Ok(new { Message = "Assignment added successfully" });
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }


        [HttpPut("archive-assignment")]
        public async Task<IActionResult> Archive(int assignmentID, [FromQuery] int senderId)
        {
            loggger.LogInformation($"Called {nameof(Archive)} from AssignmentController");
            int response = await AssignmentService.ArchiveAssignmentAsync(assignmentID);
            if(response == 0)
            {
                return BadRequest(new { Message = "Dependency" });
            }
            else if(response == 1)
            {
                notificationService.TriggerTaskNotificationForDelete(assignmentID, senderId);
                return Ok(new { Message = "Assignment archived successfully" });
            }
            else
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Not exist" });
            }

        }

        [HttpPut("{assignmentID}")]
        public async Task<IActionResult> Put(int assignmentID, [FromQuery]int senderId, [FromBody] UpdateAssignmentDTO updateAssignmentDTO)
        {
            loggger.LogInformation($"Called {nameof(updateAssignmentDTO)} from AssignmentController");

            try
            {
                var p = await AssignmentService.UpdateAssignmentAsync(updateAssignmentDTO.FromDto(), assignmentID);
                //loggger.LogWarning(updateAssignmentDTO.EmployeeIdsToAdd.ToString());
                if (updateAssignmentDTO.EmployeeIdsToAdd != null)
                {
                    var userIds = updateAssignmentDTO.EmployeeIdsToAdd.ToArray();
                    await AssignmentService.AddEmployeesToAssignmentAsync(assignmentID, userIds); //lista usera da se doda na assignment
                }
                if (updateAssignmentDTO.EmployeeIdsToRemove != null)
                {
                    var userIds = updateAssignmentDTO.EmployeeIdsToRemove.ToArray();
                    await AssignmentService.RemoveEmployeesToAssignmentAsync(assignmentID, userIds); //lista usera da se ukloni na assignment
                }
                notificationService.TriggerTaskNotificationForUpdate(assignmentID, updateAssignmentDTO.EmployeeIdsToAdd, senderId);
                notificationService.TriggerTaskNotificationForDeleteArray(assignmentID, updateAssignmentDTO.EmployeeIdsToRemove, senderId);
                return Ok(new { Message = "Assignment updated successfully" });

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(Put)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }

        }

        [HttpGet("GetAssignmentWithComments")]
        public async Task<ActionResult<GetAssignmentWithCommentsDTO>> GetAssignmentWithComments(int id)
        {
            loggger.LogInformation($"Called {nameof(GetAssignmentWithComments)} from AssignmentController");
            try
            {
                var assignment = await AssignmentService.getAssignmentWithCommentsAsync(id);
                return Ok(assignment);
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(GetAssignmentWithComments)}: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Internal server error" });
            }
        }
        [HttpGet("GetAssignmentLeader")]
        public async Task<User> GetAssignmentLeader(int id)
        {
            loggger.LogInformation($"Called {nameof(GetAssignmentLeader)} from AssignmentController");
            return await AssignmentService.GetUserLeaderByAssignmentID(id);
        }

        [HttpPut("change-status-for-assignment")]
        public async Task<IActionResult> ChangeStatus(int assignmentID, string status)
        {
            loggger.LogInformation($"Called {nameof(ChangeStatus)} from AssignmentController");
            int response = await AssignmentService.ChangeStatus(assignmentID, status);

            if (response == 1)
            {
                return Ok(new { Message = "Assignment status changed successfully" });
            }
            else
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Not exist" });
            }
        }
        [HttpGet("get-assignmentsWithListName-by-projectID-and-userID")]
        public async Task<ActionResult<List<AssignmentWithListDTO>>> GetAssignmentsByprojectIDuserID(int projectID, int userID)
        {
            loggger.LogInformation($"Called {nameof(GetAssignmentsByprojectIDuserID)} from AssignmentController");
            //return await AssignmentService.GetAssignmentsByProjectAndUserAsync(projectID, userID);

            try {
                var project = await ProjectService.GetProjectByID(projectID);
                List<Assignment> assignments;

                if (project.ProjectLeader.UserID != userID) { //  ako nije menadzer na tom projektu, pozvati  assignmentList/project/${Id}/user/${UserID}
                    assignments = await AssignmentListService.GetAssignmentsForProjectAndUserAsync(projectID, userID);
                }
                else {
                    // Fetch assignments for provided projectID
                    assignments = await ProjectService.GetAssignmentsByProjectID(projectID);
                }

                var assignmentDTOs = assignments.Select(AssignmentMapper.ToDto).ToList();

                return Ok(assignmentDTOs);
            }
            catch (Exception ex) {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }
        [HttpGet("get-completed-assignment-count-by-user/project")]
        public async Task<int> GetCompletedAssignmentCountForUserAndProject(int userId, int projectId)
        {
            loggger.LogInformation($"Called: {nameof(GetCompletedAssignmentCountForUserAndProject)} from AssignmentController");

            try
            {
                return await AssignmentService.GetCompletedAssignmentCountForUserAsync(userId, projectId);

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(GetCompletedAssignmentCountForUserAndProject)}: {ex.Message}");
                return -1;
            }
        }
        [HttpGet("get-planned-assignment-count-by-user/project")]
        public async Task<int> GetPlannedAssignmentCountForUserAndProject(int userId, int projectId)
        {
            loggger.LogInformation($"Called: {nameof(GetPlannedAssignmentCountForUserAndProject)} from AssignmentController");

            try
            {
                return await AssignmentService.GetPlannedAssignmentCountForUserAsync(userId, projectId);

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(GetPlannedAssignmentCountForUserAndProject)}: {ex.Message}");
                return -1;
            }
        }
        [HttpGet("get-inProgress-assignment-count-by-user/project")]
        public async Task<int> GetInProgressAssignmentCountForUserAndProject(int userId, int projectId)
        {
            loggger.LogInformation($"Called: {nameof(GetInProgressAssignmentCountForUserAndProject)} from AssignmentController");

            try
            {
                return await AssignmentService.GetInProgressAssignmentCountForUserAsync(userId, projectId);

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(GetInProgressAssignmentCountForUserAndProject)}: {ex.Message}");
                return -1;
            }
        }
    }
}
