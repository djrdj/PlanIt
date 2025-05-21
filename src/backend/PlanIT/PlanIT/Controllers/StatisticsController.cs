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

namespace PlanIT.API.Controllers {
    [Route("api/statistics")]
    [ApiController]
    public class StatisticsController : ControllerBase {
        public IStatisticsServices StatService { get; }
        private readonly ILoggger loggger;
        public StatisticsController(ILoggger loger, IStatisticsServices pLogic) {
            loggger = loger;
            StatService = pLogic;
        }

        /*----------------------------------------------------- GET COMMENTS COUNT BY DATE -----------------------------------------------------------------*/

        [HttpGet("get-comments-count-by-date/{projectID}")]
        public async Task<ActionResult<SortedDictionary<DateTime, int>>> GetCommentsCountByDate(int projectID) {
            try {
                var commentsByDate = await StatService.GetCommentsCountByDate(projectID);
                return Ok(commentsByDate);
            }
            catch (ArgumentException ex) {
                return NotFound(ex.Message);
            }
            catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpGet("get-comments-count-by-date/{projectID}/{assignmentListID}")]
        public async Task<ActionResult<SortedDictionary<DateTime, int>>> GetCommentsCountByDateAndAssignmentList(int projectID, int assignmentListID) {
            try {
                var commentsByDate = await StatService.GetCommentsCountByDateAndAssignmentList(projectID, assignmentListID);
                return Ok(commentsByDate);
            }
            catch (ArgumentException ex) {
                return NotFound(ex.Message);
            }
            catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }

        /*----------------------------------------------------------------------------------------------------------------------------------------------------*/

        [HttpGet("get-most-engaged-user/{projectID}")]

        public async Task<ActionResult<UserWithCountDTO>> GetUserWithMostComments(int projectID) {
            try {
                var user = await StatService.GetUserWithMostComments(projectID);

                if (user == null) {
                    return NotFound($"No comments found for project with ID {projectID}");
                }

                return Ok(user);
            }
            catch (ArgumentException ex) {
                return NotFound(ex.Message);
            }
            catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpGet("get-most-engaged-user/{projectID}/{assignmentListID}")]
        public async Task<ActionResult<UserWithCountDTO>> GetUserWithMostCommentsByAssignmentList(int projectID, int assignmentListID) {
            try {
                var user = await StatService.GetUserWithMostCommentsByAssignmentList(projectID, assignmentListID);

                if (user == null) {
                    return NotFound($"No comments found for project with ID {projectID}");
                }

                return Ok(user);
            }
            catch (ArgumentException ex) {
                return NotFound(ex.Message);
            }
            catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }

        /*----------------------------------------------------------------------------------------------------------------------------------------------------*/

        [HttpGet("get-users-on-project-with-task-count/{projectID}")]

        public async Task<ActionResult<List<UserWithCountDTO>>> GetUsersOnProjectWithTaskCount(int projectID) {
            try {
                var usersWithCounts = await StatService.GetUsersWithTaskCounts(projectID);
                return Ok(usersWithCounts);
            }
            catch (Exception ex) {
                loggger.LogError($"Error occurred while retrieving users with task counts: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

        [HttpGet("get-users-on-project-with-task-count/{projectID}/{assignmentListID}")]

        public async Task<ActionResult<List<UserWithCountDTO>>> GetUsersOnProjectWithTaskCount(int projectID, int assignmentListID) {
            try {
                var usersWithCounts = await StatService.GetUsersWithTaskCountsByAssignmentListID(projectID, assignmentListID);
                return Ok(usersWithCounts);
            }
            catch (Exception ex) {
                loggger.LogError($"Error occurred while retrieving users with task counts: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }
        /*----------------------------------------------------------------------------------------------------------------------------------------------------*/

        [HttpGet("get-users-on-project-with-completed-task-count/{projectID}")]

        public async Task<ActionResult<List<UserWithCountDTO>>> GetUsersWithCompletedTaskCounts(int projectID) {
            try {
                var usersWithCounts = await StatService.GetUsersWithCompletedTaskCounts(projectID);
                return Ok(usersWithCounts);
            }
            catch (Exception ex) {
                loggger.LogError($"Error occurred while retrieving users with task counts: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }
        [HttpGet("get-users-on-project-with-completed-task-count/{projectID}/{assignmentListID}")]

        public async Task<ActionResult<List<UserWithCountDTO>>> GetUsersWithCompletedTaskCountsByAssignmentList(int projectID, int assignmentListID) {
            try {
                var usersWithCounts = await StatService.GetUsersWithCompletedTaskCountsByAssignmentList(projectID, assignmentListID);
                return Ok(usersWithCounts);
            }
            catch (Exception ex) {
                loggger.LogError($"Error occurred while retrieving users with task counts: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }
        /*----------------------------------------------------------------------------------------------------------------------------------------------------*/

        [HttpGet("unique-users/{projectId}")]
        public async Task<ActionResult<int>> GetUniqueUserCountForProject(int projectId) {
            try {
                var uniqueUserCount = await StatService.GetUniqueUserCountForProject(projectId);
                return Ok(uniqueUserCount);
            }
            catch (Exception ex) {
                loggger.LogError($"Error occurred while retrieving unique user count for project {projectId}: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }
        [HttpGet("unique-users/{projectId}/{assignmentListID}")]
        public async Task<ActionResult<int>> GetUniqueUserCountForProjectAndAssignmentList(int projectId, int assignmentListID) {
            try {
                var uniqueUserCount = await StatService.GetUniqueUserCountForProjectAndAssignmentList(projectId, assignmentListID);
                return Ok(uniqueUserCount);
            }
            catch (Exception ex) {
                loggger.LogError($"Error occurred while retrieving unique user count for project {projectId}: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }
        /*----------------------------------------------------------------------------------------------------------------------------------------------------*/

        [HttpGet("high-priority-tasks/{projectID}")]
        public async Task<ActionResult<int>> GetHighPriorityTaskCountForProject(int projectID) {
            try {
                var highPriorityTaskCount = await StatService.GetHighPriorityTaskCountForProject(projectID);
                return Ok(highPriorityTaskCount);
            }
            catch (Exception ex) {
                loggger.LogError($"Error occurred while retrieving high priority task count for project {projectID}: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }
        [HttpGet("high-priority-tasks/{projectID}/{assignmentListID}")]
        public async Task<ActionResult<int>> GetHighPriorityTaskCountForProject(int projectID, int assignmentListID) {
            try {
                var highPriorityTaskCount = await StatService.GetHighPriorityTaskCountForProjectByAssignmentList(projectID, assignmentListID);
                return Ok(highPriorityTaskCount);
            }
            catch (Exception ex) {
                loggger.LogError($"Error occurred while retrieving high priority task count for project {projectID}: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }
        /*----------------------------------------------------------------------------------------------------------------------------------------------------*/

        [HttpGet("progress-by-statuses/{projectID}")]
        public async Task<IActionResult> GetProgressMeans(int projectID) {
            try {
                var (inProgressMean, plannedMean) = await StatService.CalculateProgressMeans(projectID);
                return Ok(new { InProgressMean = inProgressMean, PlannedMean = plannedMean });
            }
            catch (Exception ex) {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("progress-by-statuses/{projectID}/{assignmentListID}")]
        public async Task<IActionResult> CalculateProgressMeansByAssignmentList(int projectID, int assignmentListID) {
            try {
                var (inProgressMean, plannedMean) = await StatService.CalculateProgressMeansByAssignmentList(projectID, assignmentListID);
                return Ok(new { InProgressMean = inProgressMean, PlannedMean = plannedMean });
            }
            catch (Exception ex) {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /*----------------------------------------------------------------------------------------------------------------------------------------------------*/

        [HttpGet("average-time-to-complete-task/{projectID}")]
        public async Task<ActionResult<Dictionary<int, Dictionary<string, TimeSpan>>>> GetAverageTimeToCompleteTask(int projectID) {
            try {
                var averageTimes = await StatService.GetAverageTimeToCompleteTask(projectID);
                return Ok(averageTimes);
            }
            catch (ArgumentException ex) {
                return NotFound(ex.Message);
            }
            catch (Exception ex) {
                loggger.LogError($"Error occurred while calculating average time to complete tasks for project {projectID}: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }
        /*----------------------------------------------------------------------------------------------------------------------------------------------------*/

        [HttpGet("task-counts-by-status/{projectID}")]
        public async Task<ActionResult<Dictionary<string, int>>> GetTaskCountsByStatus(int projectID) {
            try {
                var taskCountsByStatus = await StatService.GetTaskCountsByStatus(projectID);
                return Ok(taskCountsByStatus);
            }
            catch (Exception ex) {
                loggger.LogError($"Error occurred while retrieving task counts by status for project {projectID}: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }
        [HttpGet("task-counts-by-status/{projectID}/{assignmentListID}")]
        public async Task<ActionResult<Dictionary<string, int>>> GetTaskCountsByStatusAndAssignmentList(int projectID, int assignmentListID) {
            try {
                var taskCountsByStatus = await StatService.GetTaskCountsByStatusAndAssignmentList(projectID, assignmentListID);
                return Ok(taskCountsByStatus);
            }
            catch (Exception ex) {
                loggger.LogError($"Error occurred while retrieving task counts by status for project {projectID}: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

    }
}