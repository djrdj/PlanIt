using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlanIT.DataAccessLayer;
using PlanIT.Models;
using PlanIT.Services.Interface;

namespace PlanIT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimeTrackingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IClockifyService _clockifyService;

        public TimeTrackingController(ApplicationDbContext context, IClockifyService icf)
        {
            _context = context;
            _clockifyService = icf;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartTimeEntry(int userId, int? projectId, int? assignmentId, string Desc)
        {
            var timeEntry = new TimeEntry
            {
                UserID = userId,
                ProjectID = projectId,
                AssignmentID = assignmentId,
                StartTime = DateTime.UtcNow,
                Description = Desc
            };

            _context.TimeEntries.Add(timeEntry);
            await _context.SaveChangesAsync();

            return Ok(timeEntry);
        }

        [HttpPost("end/{timeEntryId}")]
        public async Task<IActionResult> EndTimeEntry(int timeEntryId)
        {
            var timeEntry = await _context.TimeEntries.FindAsync(timeEntryId);
            if (timeEntry == null)
            {
                return NotFound();
            }

            timeEntry.EndTime = DateTime.UtcNow;
            timeEntry.DurationInMinutes = (int)(timeEntry.EndTime - timeEntry.StartTime)?.TotalMinutes;

            await _context.SaveChangesAsync();

            return Ok(timeEntry);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserTimeEntries(int userId) {
            var timeEntries = await _context.TimeEntries
                .Where(te => te.UserID == userId)
                 .Select(te => new {
                     TimeEntry = te,
                     Project = _context.Projects.FirstOrDefault(p => p.ProjectID == te.ProjectID),
                     //Assignment = _context.Assignments.FirstOrDefault(a => a.AssignmentID == te.AssignmentID), // Include assignment
                     Assignment = _context.Assignments
                        .Include(a => a.AssignmentList) // Include the AssignmentList directly
                        .FirstOrDefault(a => a.AssignmentID == te.AssignmentID)
                 })
                .Select(x => new {
                    x.TimeEntry,
                    ProjectName = x.Project != null ? x.Project.ProjectName : null,
                    AssignmentName = x.Assignment != null ? x.Assignment.AssignmentName : null, // Include assignment name// Include project name
                    AssignmentListID = x.Assignment != null ? x.Assignment.AssignmentList.AssignmentListID : (int?)null,
                    AssignmentListName = x.Assignment != null ? x.Assignment.AssignmentList.AssignmentListName : null
                })
                .ToListAsync();

            return Ok(timeEntries);
        }
        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetTotalTimeForProject(int projectId) {
            // Calculate the date 30 days ago from today
            var thirtyDaysAgo = DateTime.Today.AddDays(-30);

            // Query to retrieve total duration for each day within the last 30 days
            var totalTimeByDay = await _context.TimeEntries
                .Where(te => te.ProjectID == projectId && te.StartTime >= thirtyDaysAgo)
                .GroupBy(te => te.StartTime.Date) // Group by day (ignoring time component)
                .Select(g => new
                {
                    Date = g.Key,
                    TotalDurationInMinutes = g.Sum(te => te.DurationInMinutes ?? 0)
                })
                .ToListAsync();

            return Ok(totalTimeByDay);
        }

        [HttpGet("user/{userId}/project/{projectId}")]
        public async Task<IActionResult> GetUserTimeEntriesForProject(int userId, int projectId)
        {
            var timeEntries = await _context.TimeEntries
                .Where(te => te.UserID == userId && te.ProjectID == projectId)
                .ToListAsync();

            return Ok(timeEntries);
        }

        [HttpGet("user/{userId}/assignment/{assignmentId}")]
        public async Task<IActionResult> GetUserTimeEntriesForAssignment(int userId, int assignmentId)
        {
            var timeEntries = await _context.TimeEntries
                .Where(te => te.UserID == userId && te.AssignmentID == assignmentId)
                .ToListAsync();

            return Ok(timeEntries);
        }

        [HttpGet("user/{userId}/project/{projectId}/total")]
        public async Task<IActionResult> GetUserTotalTimeForProject(int userId, int projectId)
        {
            var totalDuration = await _context.TimeEntries
                .Where(te => te.UserID == userId && te.ProjectID == projectId)
                .SumAsync(te => te.DurationInMinutes ?? 0);

            return Ok(new { UserId = userId, ProjectId = projectId, TotalDurationInMinutes = totalDuration });
        }

        [HttpGet("user/{userId}/assignment/{assignmentId}/total")]
        public async Task<IActionResult> GetUserTotalTimeForAssignment(int userId, int assignmentId)
        {
            var totalDuration = await _context.TimeEntries
                .Where(te => te.UserID == userId && te.AssignmentID == assignmentId)
                .SumAsync(te => te.DurationInMinutes ?? 0);

            return Ok(new { UserId = userId, AssignmentId = assignmentId, TotalDurationInMinutes = totalDuration });
        }
    }
}
